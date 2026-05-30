import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { GetUserNotifications, MarkAsRead, MarkAllAsRead } from "../services/notification.service";
import { AuthRequest } from "../types/authRequest";

export const getMyNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  const notifications = await GetUserNotifications(req.user!.id);
  res.status(200).json({
    status: "success",
    data: { notifications },
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
