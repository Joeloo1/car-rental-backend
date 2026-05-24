import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response, Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import { RedisStore } from "connect-redis";

import config from "./config/config.env";
import logger from "./config/winston";
import { globalErrorHandler } from "./error/errorHandling";
import AppError from "./utils/AppError";
import passport from "./config/passport";
import { getClient } from "./config/redis";

import routes from "./routes/routes";

const app: Express = express();

// Development logging
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
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
    secret: config.JWT_ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

const limiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

const authLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message: "Too many login/signup attempts, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.use("/api", routes);

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.warn(`Can't find ${req.originalUrl} on this server`);
  return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
