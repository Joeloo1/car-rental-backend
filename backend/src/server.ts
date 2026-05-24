import http from "http";
import { Server } from "socket.io";
import app from "./app";
import config from "./config/config.env";
import { connectDB, disconnectDB, prisma } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import logger from "./config/winston";
import { registerChatSocket } from "./sockets/chat.socket";

const port = config.PORT;

const server = http.createServer(app);

const allowedOrigins = config.ALLOWED_ORIGINS;

export const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

registerChatSocket(io);

const cleanupExpiredTokens = async () => {
  try {
    const { count } = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (count > 0) logger.info(`Cleaned up ${count} expired refresh token(s)`);
  } catch (err) {
    logger.error("Failed to clean up expired refresh tokens:", err);
  }
};

connectDB();
connectRedis();

server.listen(port, async () => {
  logger.info(`Server running on PORT: ${port}...`);
  await cleanupExpiredTokens();
  // Re-run every 24 hours
  setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    await disconnectRedis();
    await disconnectDB();
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
