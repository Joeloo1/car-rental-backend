/**
 * Dedicated worker process entry point.
 *
 * Run this as a separate process in production so the email worker does not
 * compete with the HTTP server for the Node.js event loop:
 *
 *   node dist/worker.js          (production)
 *   pnpm dev:worker              (development)
 *
 * The API server (server.ts) still starts the worker in-process as a fallback
 * for single-process development environments.
 */
import { startEmailWorker } from "./workers/email.worker";
import logger from "./config/winston";

startEmailWorker();
logger.info("Worker process started");
