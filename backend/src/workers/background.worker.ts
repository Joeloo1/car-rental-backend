import { Worker } from "bullmq";
import { prisma } from "../config/database";
import logger from "../config/winston";

const connection = process.env.REDIS_URL ? { url: process.env.REDIS_URL } : undefined;

export const startBackgroundWorker = () => {
  if (!connection) {
    logger.warn("Background worker: Redis unavailable, worker not started");
    return null;
  }

  const worker = new Worker(
    "luxedrive-jobs",
    async (job) => {
      if (job.name === "cleanup-tokens") {
        const { count } = await prisma.refreshToken.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });
        if (count > 0) logger.info(`Cleaned up ${count} expired refresh token(s)`);
      }

      if (job.name === "auto-complete-bookings") {
        const { count } = await prisma.booking.updateMany({
          where: {
            status: { in: ["pending", "confirmed"] },
            endDate: { lt: new Date() },
          },
          data: { status: "completed" },
        });
        if (count > 0) logger.info(`Auto-completed ${count} expired booking(s)`);
      }
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (job, err) => {
    logger.error(`Background job ${job?.name} (${job?.id}) failed: ${err.message}`);
  });

  worker.on("error", (err) => {
    logger.error(`Background worker error: ${err.message}`);
  });

  logger.info("Background worker started");
  return worker;
};
