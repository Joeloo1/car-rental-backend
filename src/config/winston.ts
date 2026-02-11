import path from "node:path";
import winston from "winston";
import config from "./config.env";

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

// Create Console Format
const consoleFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  colorize({ all: true }),
  printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  }),
);

// Create File Format
const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
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
