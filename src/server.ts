import http from "http";
import { Server } from "socket.io";
import { registerChatSocket } from "./sockets/chat.socket";
import app from "./app";
import config from "./config/config.env";
import { connectDB } from "./config/database";
import logger from "./config/winston";

const port = config.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

registerChatSocket(io);
connectDB();
server.listen(port, () => {
  logger.info(`Server running on PORT: ${port}...`);
  console.log(`Server running on PORT: ${port}... `);
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
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
