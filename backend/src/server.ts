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

const autoCompleteExpiredBookings = async () => {
  try {
    const now = new Date();

    // Find all pending/confirmed bookings whose rental period has ended
    const expired = await prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        endDate: { lt: now },
      },
      include: { car: { select: { id: true, title: true, lenderId: true } } },
    });

    if (expired.length === 0) return;

    // Mark them completed and free the cars in one transaction
    await prisma.$transaction([
      prisma.booking.updateMany({
        where: { id: { in: expired.map((b) => b.id) } },
        data: { status: "completed" },
      }),
      prisma.car.updateMany({
        where: { id: { in: [...new Set(expired.map((b) => b.carId))] } },
        data: { availabilityStatus: "available" },
      }),
    ]);

    logger.info(`Auto-completed ${expired.length} expired booking(s)`);
  } catch (err) {
    logger.error("Failed to auto-complete expired bookings:", err);
  }
};

connectDB();
connectRedis();

server.listen(port, async () => {
  logger.info(`Server running on PORT: ${port}...`);
  await cleanupExpiredTokens();
  await autoCompleteExpiredBookings();
  // Refresh token cleanup: every 24 hours
  setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
  // Booking auto-completion: every hour
  setInterval(autoCompleteExpiredBookings, 60 * 60 * 1000);
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
