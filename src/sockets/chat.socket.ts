import { Server, Socket } from "socket.io";
import { prisma } from "../config/database";
import logger from "../config/winston";
import { verifyAccessToken } from "../utils/jwt";

export const registerChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);
    logger.info(`Socket connected ${socket.id}`);

    socket.on("authenticate", async (token: string, callback?: Function) => {
      try {
        // Verify Jwt Token
        const decoded = (await verifyAccessToken(token)) as { id: string };

        socket.data.userId = decoded.id;

        logger.info(`Socket ${socket.id} authenticated as ${decoded.id}`);

        if (callback) callback({ success: true });
      } catch (err) {
        logger.error("Socket auth failed", err);
        if (callback) callback({ success: false });
      }
    });

    socket.on("join_chat", async (chatId: string) => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            OR: [{ userId }, { lenderId: userId }],
          },
        });

        if (!chat) {
          socket.emit("chat_error", "Unauthorized to join this chat");
          return;
        }

        socket.join(chatId);

        logger.info(`User ${userId} joined chat room ${chatId}`);

        const message = await prisma.message.findMany({
          where: { chatId },
          orderBy: { createdAt: "asc" },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        socket.emit("message_history", message);
      } catch (err) {
        logger.error(err);
        socket.emit("chat_error", "Failed to join chat");
      }
    });

    socket.on(
      "initiate_chat",
      async (data: { carId: string; lenderId: string }) => {
        const userId = socket.data.userId;
        if (!userId) return;

        try {
          const chat = await prisma.chat.upsert({
            where: {
              carId_userId: { carId: data.carId, userId },
            },
            create: {
              carId: data.carId,
              userId,
              lenderId: data.lenderId,
            },
            update: {},
          });

          socket.join(chat.id);
          socket.emit("chat_initiated", { chatId: chat.id });
        } catch (err) {
          logger.error(err);
          socket.emit("chat_error", "Failed to initiate chat");
        }
      },
    );

    // Send a message inside a chat room
    socket.on(
      "send_message",
      async (data: { chatId: string; messageText: string }) => {
        const senderId = socket.data.userId;
        if (!senderId) return;

        try {
          // Verify sender belongs to this chat before saving
          const chat = await prisma.chat.findFirst({
            where: {
              id: data.chatId,
              OR: [{ userId: senderId }, { lenderId: senderId }],
            },
          });

          if (!chat) {
            socket.emit("error", "Unauthorized");
            return;
          }

          const message = await prisma.message.create({
            data: {
              chatId: data.chatId,
              senderId,
              messageText: data.messageText,
              status: "sent",
            },
            include: {
              sender: { select: { id: true, name: true } },
            },
          });

          // Emit only to people in this specific chat room
          io.to(data.chatId).emit("new_message", message);
        } catch (err) {
          logger.error(err);
          socket.emit("chat_error", "Failed to send message");
        }
      },
    );

    // Mark messages as read when the other party opens the chat
    socket.on("mark_read", async (chatId: string) => {
      const userId = socket.data.userId;

      try {
        await prisma.message.updateMany({
          where: {
            chatId,
            senderId: { not: userId },
            status: { not: "read" },
          },
          data: { status: "read" },
        });

        // Notify the sender their messages were read
        io.to(chatId).emit("messages_read", { chatId, readBy: userId });
      } catch (err) {
        logger.error(err);
      }
    });

    // Typing indicators scoped to a chat room
    socket.on("typing", (chatId: string) => {
      socket.to(chatId).emit("typing", { chatId, userId: socket.data.userId });
    });

    socket.on("stop_typing", (chatId: string) => {
      socket.to(chatId).emit("stop_typing", { chatId });
    });

    // Get all chat for lender
    socket.on("get_lender_chats", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      try {
        const chats = await prisma.chat.findMany({
          where: { lenderId: userId },
          include: {
            user: { select: { id: true, name: true } },
            car: { select: { id: true } },
          },
        });

        socket.emit("lender_chats", chats);
      } catch (err) {
        logger.error(err);
        socket.emit("chat_error", "Failed to fetch chats");
      }
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
