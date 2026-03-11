import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import logger from "./winston";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
  adapter,
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
