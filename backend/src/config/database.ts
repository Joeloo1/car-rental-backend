import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import logger from "./winston";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dns from "dns";

// Global DNS override to force IPv4 only.
// This permanently solves the broken local IPv6 routing issues that cause ETIMEDOUT.
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = function (hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else if (typeof options === "number") {
    options = { family: options };
  } else if (!options) {
    options = {};
  }
  options.family = 4;
  return originalLookup(hostname, options, callback);
};

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
