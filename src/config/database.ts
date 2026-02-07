import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import logger from "./winston";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("🟢 DB Connected via Prisma + Neon");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`DB connection error: ${message}`);
    console.error(`DB connection error: ${message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info("DB disconnected");
};
