import { Server, Socket } from "socket.io";
import xss from "xss";
import { z } from "zod";
import { prisma } from "../config/database";
import logger from "../config/winston";
import { verifyAccessToken } from "../utils/jwt";
import { CreateNotification } from "../services/notification.service";
import { getNewMessageEmailHtml } from "../utils/email";
import { dispatchEmail } from "../workers/email.worker";
import config from "../config/config.env";
import { incrCache, getCache, setCache } from "../config/redis";
import { CHAT_MAX_MSG_LENGTH, CHAT_RATE_LIMIT_COUNT } from "../config/constants";

const RATE_LIMIT_MAX = CHAT_RATE_LIMIT_COUNT;
const RATE_LIMIT_WINDOW_S = 60;

// Redis-backed rate limiter — works correctly across multiple server instances.
// Falls open (returns false) when Redis is unavailable so chat still works.
async function isRateLimited(userId: string): Promise<boolean> {
  const count = await incrCache(`chat:rl:${userId}`, RATE_LIMIT_WINDOW_S);
  return count > RATE_LIMIT_MAX;
}

export const registerChatSocket = (io: Server) => {
  // Authenticate via handshake token if provided; allow event-based auth as fallback
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const decoded = (await verifyAccessToken(token)) as { id: string };
        socket.data.userId = decoded.id;
        socket.join(`user_${decoded.id}`);
      } catch {
        // Invalid token — reject immediately instead of silently connecting
        return next(new Error("Authentication failed"));
      }
    }
    next();
  });

  // Disconnect sockets that never authenticated within 10 seconds
  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected ${socket.id}`);

    if (!socket.data.userId) {
      const timeout = setTimeout(() => {
        if (!socket.data.userId) {
          logger.warn(`Socket ${socket.id} disconnected — no auth within 10s`);
          socket.disconnect();
        }
      }, 10_000);
      socket.once("disconnect", () => clearTimeout(timeout));
    }

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

      const parsed = z
        .object({ carId: z.string().uuid(), lenderId: z.string().uuid() })
        .safeParse(data);
      if (!parsed.success) {
        socket.emit("chat_error", "Invalid chat parameters");
        return;
      }

      try {
        const [car, lender] = await Promise.all([
          prisma.car.findUnique({
            where: { id: parsed.data.carId },
            select: { lenderId: true },
          }),
          prisma.user.findUnique({
            where: { id: parsed.data.lenderId },
            select: { role: true },
          }),
        ]);

        if (!car || !lender || lender.role !== "lender" || car.lenderId !== parsed.data.lenderId) {
          socket.emit("chat_error", "Invalid car or lender");
          return;
        }

        const chat = await prisma.chat.upsert({
          where: {
            carId_userId: { carId: parsed.data.carId, userId },
          },
          create: {
            carId: parsed.data.carId,
            userId,
            lenderId: parsed.data.lenderId,
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

      // Validate raw length before any processing
      const raw = (data.messageText ?? "").trim();
      if (!raw || raw.length > CHAT_MAX_MSG_LENGTH) {
        socket.emit("chat_error", "Message must be between 1 and 1000 characters");
        return;
      }

      // Rate limit: 30 messages per minute per user
      if (await isRateLimited(senderId)) {
        socket.emit("chat_error", "You are sending messages too quickly, please slow down");
        return;
      }

      // Sanitise only after guards pass
      const text = xss(raw);

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
          // Throttle: send at most one offline email per chat per 30 minutes
          const throttleKey = `chat:offline-email:${recipientId}:${data.chatId}`;
          const alreadySent = await getCache<boolean>(throttleKey);

          if (!alreadySent) {
            try {
              const [recipient, car] = await Promise.all([
                prisma.user.findUnique({
                  where: { id: recipientId },
                  select: { email: true, name: true },
                }),
                prisma.car.findUnique({
                  where: { id: chat.carId },
                  select: { model: true, brand: true },
                }),
              ]);

              if (recipient?.email) {
                const carLabel = car ? `${car.brand} ${car.model}` : "your listing";
                const baseUrl = config.CLIENT_URL || "http://localhost:5173";
                // Lenders go to /lender, renters go to /dashboard
                const dashboardUrl =
                  recipientId === chat.lenderId
                    ? `${baseUrl}/lender`
                    : `${baseUrl}/dashboard`;

                await dispatchEmail({
                  email: recipient.email,
                  subject: `New message from ${message.sender.name} — LuxeDrive`,
                  html: getNewMessageEmailHtml(
                    message.sender.name,
                    message.messageText,
                    carLabel,
                    dashboardUrl,
                  ),
                });

                // Mark as sent for 30 minutes so we don't flood their inbox
                await setCache(throttleKey, true, 30 * 60);
              }
            } catch (emailErr) {
              logger.error("Failed to send offline message email", emailErr);
            }
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
