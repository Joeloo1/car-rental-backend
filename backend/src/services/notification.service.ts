import { getSocketIO } from "../utils/socketInstance";
import { prisma } from "../config/database";
import logger from "../config/winston";
import AppError from "../utils/AppError";
import { getCache, setCache, deleteCacheByPattern } from "../config/redis";

const TTL_NOTIFICATIONS = 60; // 1 minute

export type NotificationType = "booking" | "message" | "info" | "success" | "warning";

export const CreateNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info",
  link?: string,
) => {
  try {
    // 1. Save to Database
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, isRead: false, link },
    });

    // 2. Emit via Socket.io (io may be null during early startup — gracefully skip)
    const io = getSocketIO();
    io?.to(`user_${userId}`).emit("new_notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link,
      createdAt: notification.createdAt,
    });

    await deleteCacheByPattern(`notifications:${userId}:*`);

    logger.info(`Notification sent to User ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error("Failed to create notification:", error);
    // Don't throw, let the main process continue even if notification fails
  }
};

export const GetUserNotifications = async (userId: string, page = 1, limit = 20) => {
  const cacheKey = `notifications:${userId}:${page}:${limit}`;
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  const result = { notifications, total, page, totalPages: Math.ceil(total / limit) };
  await setCache(cacheKey, result, TTL_NOTIFICATIONS);
  return result;
};

export const MarkAsRead = async (notificationId: string, userId: string) => {
  return await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const MarkAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const GetUnreadNotificationCountService = async (userId: string) => {
  return await prisma.notification.count({ where: { userId, isRead: false } });
};

export const DeleteNotificationService = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new AppError("Notification not found", 404);
  if (notification.userId !== userId) throw new AppError("Unauthorized", 403);
  await prisma.notification.delete({ where: { id: notificationId } });
  await deleteCacheByPattern(`notifications:${userId}:*`);
};

export const DeleteAllNotificationsService = async (userId: string) => {
  await prisma.notification.deleteMany({ where: { userId } });
  await deleteCacheByPattern(`notifications:${userId}:*`);
};
