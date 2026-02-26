import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import config from "./config/config.env";
import { globalErrorHandler } from "./error/errorHandling";
import AppError from "./utils/AppError";
import logger from "./config/winston";

import categoryRoutes from "./routes/category.routes";
import authRoutes from "./routes/auth/auth.routes";
import addressRoutes from "./routes/address.routes";
import carRoutes from "./routes/car.routes";
import adminUserRoutes from "./routes/admin/admin.user.routes";
import reviewRoutes from "./routes/review.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

// Development logging
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security HTTP Headers
app.use(helmet());

app.use(cookieParser());

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Request Limiting from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "To many request from this IP,Please try again later ",
});

app.use("/api", limiter);

/*
 * ROUTES
 */
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chats", chatRoutes);

/*
 * Handling unhandle Routes
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.warn(`Can't find ${req.originalUrl} on this server`);
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404),
  );
});

/*
 * Global Error Hander
 */
app.use(globalErrorHandler);
export default app;
