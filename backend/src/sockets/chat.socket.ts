import { Server, Socket } from "socket.io";
import { prisma } from "../config/database";
import logger from "../config/winston";
import { verifyAccessToken } from "../utils/jwt";
import { CreateNotification } from "../services/notification.service";
import { sendEmail, getNewMessageEmailHtml } from "../utils/email";
import config from "../config/config.env";

// Per-user in-memory rate limiter: max 30 messages per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  return false;
}

export const registerChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected ${socket.id}`);

    socket.on("authenticate", async (token: string, callback?: Function) => {
      try {
        // Verify Jwt Token
        const decoded = (await verifyAccessToken(token)) as { id: string };

        socket.data.userId = decoded.id;

        // Join a global room for this user to receive notifications
        socket.join(`user_${decoded.id}`);

        logger.info(
          `Socket ${socket.id} authenticated as ${decoded.id} and joined room user_${decoded.id}`,
        );

        if (callback) callback({ success: true });
      } catch (err) {
        logger.error("Socket auth failed", err);
        if (callback) callback({ success: false });
      }
    });

    socket.on(
      "join_chat",
      async (payload: string | { chatId: string; before?: string; limit?: number }) => {
        const userId = socket.data.userId;
        if (!userId) return;

        const chatId = typeof payload === "string" ? payload : payload.chatId;
        const before = typeof payload === "object" ? payload.before : undefined;
        const limit = typeof payload === "object" ? Math.min(payload.limit ?? 50, 100) : 50;

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

          const messages = await prisma.message.findMany({
            where: {
              chatId,
              ...(before ? { createdAt: { lt: new Date(before) } } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
              sender: {
                select: { id: true, name: true },
              },
            },
          });

          socket.emit("message_history", messages.reverse());
        } catch (err) {
          logger.error(err);
          socket.emit("chat_error", "Failed to join chat");
        }
      },
    );

    socket.on("initiate_chat", async (data: { carId: string; lenderId: string }) => {
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
    });

    // Send a message inside a chat room
    socket.on("send_message", async (data: { chatId: string; messageText: string }) => {
      const senderId = socket.data.userId;
      if (!senderId) return;

      // Validate message content
      const text = (data.messageText ?? "").trim();
      if (!text || text.length > 1000) {
        socket.emit("chat_error", "Message must be between 1 and 1000 characters");
        return;
      }

      // Rate limit: 30 messages per minute per user
      if (isRateLimited(senderId)) {
        socket.emit("chat_error", "You are sending messages too quickly, please slow down");
        return;
      }

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
            messageText: text,
            status: "sent",
          },
          include: {
            sender: { select: { id: true, name: true } },
          },
        });

        // Emit only to people in this specific chat room
        io.to(data.chatId).emit("new_message", message);

        // Persist notification and optionally email if recipient is offline
        const recipientId = chat.userId === senderId ? chat.lenderId : chat.userId;

        // Always save notification to DB so it shows in the drawer on next login
        const notifLink = recipientId === chat.lenderId ? "/lender" : "/dashboard";
        await CreateNotification(
          recipientId,
          `New message from ${message.sender.name}`,
          message.messageText.length > 100
            ? message.messageText.slice(0, 97) + "..."
            : message.messageText,
          "message",
          notifLink,
        );

        // Check if recipient has an active socket connection
        const recipientRoom = io.sockets.adapter.rooms.get(`user_${recipientId}`);
        const isOnline = recipientRoom && recipientRoom.size > 0;

        if (!isOnline) {
          try {
            const recipient = await prisma.user.findUnique({
              where: { id: recipientId },
              select: { email: true, name: true },
            });
            const car = await prisma.car.findUnique({
              where: { id: chat.carId },
              select: { model: true, brand: true },
            });

            if (recipient?.email) {
              const carLabel = car ? `${car.brand} ${car.model}` : "your listing";
              await sendEmail({
                email: recipient.email,
                subject: `New message from ${message.sender.name} — LuxeDrive`,
                html: getNewMessageEmailHtml(
                  message.sender.name,
                  message.messageText,
                  carLabel,
                  config.CLIENT_URL || "http://localhost:5173",
                ),
              });
            }
          } catch (emailErr) {
            logger.error("Failed to send offline message email", emailErr);
          }
        }
      } catch (err) {
        logger.error(err);
        socket.emit("chat_error", "Failed to send message");
      }
    });

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
