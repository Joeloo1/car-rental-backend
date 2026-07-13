import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { AuthRequest } from "../../types/authRequest";
import {
  GetAllCarsAdminService,
  AdminApproveCarService,
  AdminRejectCarService,
  GetPlatformStatsService,
  GetAllBookingsAdminService,
} from "../../services/admin/admin.car.service";

export const getAllCarsAdmin = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const approved =
    req.query.approved === "true" ? true : req.query.approved === "false" ? false : undefined;
  const deleted = req.query.deleted === "true";

  const result = await GetAllCarsAdminService(page, limit, approved, deleted);

  res.status(200).json({ status: "success", data: result });
});

export const approveCar = catchAsync(async (req: AuthRequest, res: Response) => {
  const car = await AdminApproveCarService(req.params.id as string, req.user!.id);
  res.status(200).json({ status: "success", message: "Car approved", data: { car } });
});

export const rejectCar = catchAsync(async (req: AuthRequest, res: Response) => {
  const car = await AdminRejectCarService(req.params.id as string, req.user!.id);
  res.status(200).json({ status: "success", message: "Car rejected", data: { car } });
});

export const getPlatformStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await GetPlatformStatsService();
  res.status(200).json({ status: "success", data: { stats } });
});

export const getAllBookingsAdmin = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = req.query.status as string | undefined;

  const result = await GetAllBookingsAdminService(page, limit, status);
  res.status(200).json({ status: "success", data: result });
});
