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
