import path from "node:path";
import winston from "winston";
import config from "./config.env";
import { getRequestId } from "../utils/requestContext";

const { combine, colorize, printf, timestamp, errors, json } = winston.format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const level = () => {
  const env = config.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

const addRequestId = winston.format((info) => {
  info.requestId = getRequestId(); // "-" outside a request context
  return info;
});

// Create Console Format
const consoleFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  colorize({ all: true }),
  addRequestId(),
  printf((info) => {
    const { timestamp, level, message, requestId, ...meta } = info;
    // Only print the bracket when inside a real request (not startup/cron logs)
    const reqTag = requestId && requestId !== "-" ? ` [${requestId}]` : "";
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
    return `[${timestamp}]${reqTag} ${level}: ${message} ${metaStr}`;
  }),
);

// Create File Format — requestId ends up as a top-level JSON field,
// making it trivially greppable in log aggregators (Datadog, Loki, etc.)
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  addRequestId(),
  json(),
);

/*
 * Create Transports
 */

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join("logs", "combine.log"),
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

/*
 * Create Logger
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "exceptions.log"),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "rejection.log"),
      format: fileFormat,
    }),
  ],
});

export default logger;
