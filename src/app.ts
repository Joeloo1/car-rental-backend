import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import config from "./config/config.env";
import { globalErrorHandler } from "./error/errorHandling";

import AppError from "./utils/AppError";
import logger from "./config/winston";

const app = express();

// Development logging
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security HTTP Headers
app.use(helmet());

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
