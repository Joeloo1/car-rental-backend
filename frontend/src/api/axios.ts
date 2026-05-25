import axios from "axios";
import { toast } from "react-hot-toast";
import { tokenStore } from "../utils/tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
