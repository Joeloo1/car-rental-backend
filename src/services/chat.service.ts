import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import logger from "../config/winston";

/**
 * Get Users Chats
 */
export const GetUsersChatService = async (userId: string) => {
  return await prisma.chat.findMany({
    where: {
      OR: [{ userId }, { lenderId: userId }],
    },
    include: {
      user: { select: { id: true, name: true } },
      lender: { select: { id: true, name: true } },
      car: { select: { id: true, model: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get messages for a chat
 */
export const GetChatMessagesServices = async (
  chatId: string,
  userId: string,
) => {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, OR: [{ userId }, { lenderId: userId }] },
  });

  if (!chat) {
    logger.warn(`User Unauthenticated`);
    throw new AppError("User Unauthenticated", 403);
  }

  return await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });
};

/**
 * Create a Chat
 */
export const InitiateChatService = async (
  carId: string,
  userId: string,
  lenderId: string,
) => {
  const chat = await prisma.chat.upsert({
    where: {
      carId_userId: { carId, userId },
    },
    create: {
      carId,
      userId,
      lenderId,
    },
    update: {},
  });
};

/**
 * Delete Chat
 */
export const DeleteChatService = async (chatId: string, userId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      OR: [{ userId }, { lenderId: userId }],
    },
  });

  if (!chat) {
    logger.warn(`User Unauthenticated`);
    throw new AppError("User Unauthenticated", 403);
  }

  return prisma.chat.delete({
    where: { id: chatId },
  });
};
