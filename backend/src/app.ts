import cookieParser from "cookie-parser";
import { REFRESH_TOKEN_TTL_MS } from "./config/constants";
import cors from "cors";
import express, { NextFunction, Request, Response, Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { randomUUID } from "crypto";
import { doubleCsrf } from "csrf-csrf";

// Extend express-session so we can mark sessions for persistence
declare module "express-session" {
  interface SessionData {
    csrfInit?: boolean;
  }
}

import config from "./config/config.env";
import logger from "./config/winston";
import { prisma } from "./config/database";
import { globalErrorHandler } from "./error/errorHandling";
import AppError from "./utils/AppError";
import passport from "./config/passport";
import { getClient } from "./config/redis";
import { requestContext } from "./utils/requestContext";
import routes from "./routes/routes";

const app: Express = express();

// "__Host-" prefix requires the Secure flag; use it only in production
const csrfCookieName =
  config.NODE_ENV === "production" ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => config.CSRF_SECRET,
  cookieName: csrfCookieName,
  cookieOptions: { secure: config.NODE_ENV === "production" },
  size: 64,
  getSessionIdentifier: (req) => req.session.id,
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  requestContext.run({ requestId }, next);
});

morgan.token("request-id", (req) => req.headers["x-request-id"] as string);

if (config.NODE_ENV === "development") {
  app.use(morgan(":request-id :method :url :status :response-time ms"));
}

// Set security HTTP Headers
app.use(helmet());

app.use(cookieParser());

// Session configuration — uses Redis when available, falls back to in-memory
const buildSessionStore = () => {
  const client = getClient();
  if (client) return new RedisStore({ client });
  logger.warn("Redis unavailable — using in-memory session store (not suitable for production)");
  return undefined;
};

app.use(
  session({
    store: buildSessionStore(),
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL_MS,
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

// Force the session to be saved before generating the token.
// With saveUninitialized:false, an unmodified session is never persisted, so the
// subsequent POST would arrive with a brand-new session ID, making the HMAC mismatch.
// Setting csrfInit marks the session as modified, which triggers the save.
app.get("/api/csrf-token", (req, res, next) => {
  req.session.csrfInit = true;
  req.session.save((err) => {
    if (err) return next(err);
    res.json({ csrfToken: generateCsrfToken(req, res) });
  });
});

app.use(doubleCsrfProtection);

const limiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1", limiter);

const authLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message: "Too many login/signup attempts, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/signup", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);

app.use("/api/v1", routes);

app.get("/health", async (_req, res) => {
  const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    db: dbOk,
    ts: new Date().toISOString(),
  });
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.warn(`Can't find ${req.originalUrl} on this server`);
  return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
