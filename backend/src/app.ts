import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response, Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";

import config from "./config/config.env";
import logger from "./config/winston";
import { globalErrorHandler } from "./error/errorHandling";
import AppError from "./utils/AppError";
import passport from "./config/passport";

import routes from "./routes/routes";
// import categoryRoutes from "./routes/category.routes";
// import authRoutes from "./routes/auth/auth.routes";
// import userRoutes from "./routes/user/user.route";
// import addressRoutes from "./routes/address.routes";
// import carRoutes from "./routes/car.routes";
// import adminUserRoutes from "./routes/admin/admin.user.routes";
// import reviewRoutes from "./routes/review.routes";
// import chatRoutes from "./routes/chat.routes";

const app: Express = express();

// Development logging
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security HTTP Headers
app.use(helmet());

app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: config.JWT_ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      config.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  }),
);
const limiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Strict limiting for auth routes to prevent brute-force
const authLimiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many login/signup attempts, please try again in an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

/**
 * ROUTES
 */
app.use("/api", routes);

/**
 * Handling unhandled Routes
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.warn(`Can't find ${req.originalUrl} on this server`);
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404),
  );
});

/*
 * Global Error Handler
 */
app.use(globalErrorHandler);

export default app;
