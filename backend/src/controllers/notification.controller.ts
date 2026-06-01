import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { GetUserNotifications, MarkAsRead, MarkAllAsRead } from "../services/notification.service";
import { AuthRequest } from "../types/authRequest";

export const getMyNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) ?? "20", 10) || 20));
  const result = await GetUserNotifications(req.user!.id, page, limit);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

export const markRead = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const params = req.params.id as string;
  await MarkAsRead(params, userId);
  res.status(200).json({
    status: "success",
    message: "Notification marked as read",
  });
});

export const markAllRead = catchAsync(async (req: AuthRequest, res: Response) => {
  await MarkAllAsRead(req.user!.id);
  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});
