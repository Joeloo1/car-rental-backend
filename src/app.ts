import express, { urlencoded } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import config from "./config/config.env";

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

export default app;
