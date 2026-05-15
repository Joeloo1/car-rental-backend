import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import logger from "../config/winston";

interface CustomError extends Error {
  status?: string;
  statusCode?: number;
  code?: number | string;
  name: string;
  isOperational: boolean;
  meta?: { target?: string } | any;
  detail?: string;
  column?: string;
}

// Prisma Error Handlers
const handlePrismaValidationError = (err: CustomError) => {
  const message = `Invalid input data: ${err.message}`;
  return new AppError(message, 400);
};

const handlePrismaUniqueConstraintError = (err: CustomError) => {
  const target = err.meta?.target || "field";
  const message = `Duplicate field value for ${target}. Please use another value.`;
  return new AppError(message, 400);
};

const handlePrismaForeignKeyError = (err: CustomError) => {
  const target = err.meta?.target || "field";
  const message = `Foreign key constraint failed: ${target} does not exist.`;
  return new AppError(message, 400);
};

const handlePrismaNotFoundError = () => {
  return new AppError("Record not found with the provided identifier.", 404);
};

const handlePrismaKnownRequestError = (err: CustomError) => {
  switch (err.code) {
    case "P2002":
      return handlePrismaUniqueConstraintError(err);
    case "P2003":
      return handlePrismaForeignKeyError(err);
    case "P2025":
      return handlePrismaNotFoundError();
    case "P2014":
      return handlePrismaValidationError(err);
    default:
      return new AppError(err.message || "Database error", 500);
  }
};

// PostgreSQL Error Handlers
const handlePostgresUniqueViolationError = (err: CustomError) => {
  const match = err.detail?.match(/Key \(([^)]+)\)=/);
  const field = match ? match[1] : "field";
  const message = `Duplicate value for ${field}. Please provide another value.`;
  return new AppError(message, 400);
};

const handlePostgresForeignKeyViolationError = () => {
  const message =
    "Foreign key constraint violation: The provided value does not exist.";
  return new AppError(message, 400);
};

const handlePostgresNotNullViolationError = (err: CustomError) => {
  const field = err.column || "field";
  const message = `${field} cannot be null, Please provide a value!`;
  return new AppError(message, 400);
};

// send error in development
const sendErrorDev = (err: CustomError, res: Response) => {
  logger.error("Error:", err);
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// send error n production
const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    logger.error("ERROR 💥", err);
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Global Error Handling Middleware
export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  let error: AppError = new AppError(
    err.message || "Internal Server Error",
    err.statusCode || 500,
  );

  // Prisma errors
  if (err.name === "PrismaClientValidationError")
    error = handlePrismaValidationError(err);
  if (err.name === "PrismaClientKnownRequestError")
    error = handlePrismaKnownRequestError(err);

  // PostgreSQL errors
  if (err.code === "23505") error = handlePostgresUniqueViolationError(err);
  if (err.code === "23503") error = handlePostgresForeignKeyViolationError();
  if (err.code === "23502") error = handlePostgresNotNullViolationError(err);

  return sendErrorProd(error, res);
};
