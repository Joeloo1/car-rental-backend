import axios from "axios";
import { toast } from "react-hot-toast";
import { tokenStore } from "../utils/tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── CSRF token management ─────────────────────────────────────────────────────
// Fetch once, reuse across requests. On CSRF rejection, invalidate and re-fetch.
let _csrfToken: string | null = null;
let _csrfFetch: Promise<string> | null = null;

const MUTATING = new Set(["post", "put", "patch", "delete"]);

const getCsrfToken = (): Promise<string> => {
  if (_csrfToken) return Promise.resolve(_csrfToken);
  if (_csrfFetch) return _csrfFetch;
  _csrfFetch = axios
    .get<{ csrfToken: string }>("/api/csrf-token", { withCredentials: true })
    .then((res) => {
      _csrfToken = res.data.csrfToken;
      _csrfFetch = null;
      return _csrfToken;
    })
    .catch((err) => {
      _csrfFetch = null;
      throw err;
    });
  return _csrfFetch;
};

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.method && MUTATING.has(config.method.toLowerCase())) {
      config.headers["x-csrf-token"] = await getCsrfToken();
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor with parallel-401 queue ─────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never try to silently refresh when the failing request IS the refresh endpoint —
    // that would cause an infinite loop. Just let the error propagate so AuthContext
    // or ProtectedRoute can decide what to do.
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh-token");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = res.data;
        tokenStore.set(accessToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        // Do NOT redirect here — ProtectedRoute handles unauthenticated redirects.
        // A hard location change would reload the page and restart the whole cycle.
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Stale CSRF token — invalidate, re-fetch, and retry once
    if (
      error.response?.status === 403 &&
      !originalRequest._csrfRetry &&
      error.response?.data?.message?.toLowerCase().includes("csrf")
    ) {
      originalRequest._csrfRetry = true;
      _csrfToken = null;
      originalRequest.headers["x-csrf-token"] = await getCsrfToken();
      return api(originalRequest);
    }

    // Show toast for non-401 errors
    if (error.response?.status !== 401) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      const silentErrors = ["Network Error", "timeout"];
      const shouldShowToast = !silentErrors.some((err) => errorMessage.includes(err));

      if (shouldShowToast) {
        toast.error(errorMessage, {
          duration: 4000,
          style: { maxWidth: "500px" },
        });
      }
    }

    return Promise.reject(error);
  },
);

export default api;
