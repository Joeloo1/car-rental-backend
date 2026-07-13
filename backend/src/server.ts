import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import app from "./app";
import config from "./config/config.env";
import { connectDB, disconnectDB, prisma } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import logger from "./config/winston";
import { registerChatSocket } from "./sockets/chat.socket";
import { setSocketIO } from "./utils/socketInstance";
import { jobQueue } from "./config/queue";
import { startBackgroundWorker } from "./workers/background.worker";
import { AUTO_COMPLETE_INTERVAL_MS, TOKEN_CLEANUP_INTERVAL_MS } from "./config/constants";

const port = config.PORT;

const server = http.createServer(app);
server.requestTimeout = 30_000;
server.headersTimeout = 35_000;

const allowedOrigins = config.ALLOWED_ORIGINS;

const pubClient = new Redis(config.REDIS_URL || "redis://localhost:6379");
const subClient = pubClient.duplicate();

export const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

setSocketIO(io);
io.adapter(createAdapter(pubClient, subClient));

registerChatSocket(io);

const runOnce = async (task: string, fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (err) {
    logger.error(`Startup task "${task}" failed:`, err);
  }
};

const registerRepeatableJobs = async () => {
  if (!jobQueue) return;

  await jobQueue.add("cleanup-tokens", {}, {
    repeat: { every: TOKEN_CLEANUP_INTERVAL_MS },
    jobId: "cleanup-tokens",
  });
  await jobQueue.add("auto-complete-bookings", {}, {
    repeat: { every: AUTO_COMPLETE_INTERVAL_MS },
    jobId: "auto-complete-bookings",
  });

  logger.info("Repeatable background jobs registered");
};

connectDB();
connectRedis();

startBackgroundWorker();

server.listen(port, async () => {
  logger.info(`Server running on PORT: ${port}...`);

  // Run once immediately on startup so stale records are cleared before first request
  await runOnce("cleanup-tokens", async () => {
    const { count } = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (count > 0) logger.info(`Cleaned up ${count} expired refresh token(s)`);
  });

  await runOnce("auto-complete-bookings", async () => {
    const { count } = await prisma.booking.updateMany({
      where: { status: { in: ["pending", "confirmed"] }, endDate: { lt: new Date() } },
      data: { status: "completed" },
    });
    if (count > 0) logger.info(`Auto-completed ${count} expired booking(s)`);
  });

  // Schedule recurring runs via BullMQ (cluster-safe — only one worker picks each job)
  await registerRepeatableJobs();
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    await Promise.all([pubClient.quit(), subClient.quit(), disconnectRedis(), disconnectDB()]);
    if (server) {
      server.close(async () => {
        logger.info("⛔ HTTP server closed.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    logger.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err: Error) => {
  logger.error("💥 UNHANDLED REJECTION!");
  logger.error(err);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err: Error) => {
  logger.error("💥 UNCAUGHT EXCEPTION!");
  logger.error(err);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
