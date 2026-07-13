import { Response } from "express";
import catchAsync from "../utils/catchAsync";
import { AuthRequest } from "../types/authRequest";
import {
  CreateBookingService,
  GetUserBookingsService,
  GetLenderBookingsService,
  UpdateBookingStatusService,
  GetDashboardStatsService,
  GetBookingByIdService,
} from "../services/booking.service";
import { CreateBookingSchema, UpdateBookingStatusSchema } from "../schema/booking.schema";

export const createBooking = catchAsync(async (req: AuthRequest, res: Response) => {
  const carId = req.params.carId as string;
  const bookingData = CreateBookingSchema.parse({
    body: req.body,
    params: { carId },
  }).body;

  const booking = await CreateBookingService(carId, bookingData, req.user!.id);

  res.status(201).json({
    status: "success",
    message: "Booking created successfully",
    data: { booking },
  });
});

export const getMyBookings = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

  const result = await GetUserBookingsService(req.user!.id, page, limit);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

export const getLenderBookings = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

  const result = await GetLenderBookingsService(req.user!.id, page, limit);

  res.status(200).json({
    status: "success",
    data: result,
  });
});

export const updateBookingStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = UpdateBookingStatusSchema.parse({
    body: req.body,
    params: { id },
  }).body;

  await UpdateBookingStatusService(id, status, req.user!.id, req.user!.role);

  res.status(200).json({
    status: "success",
    message: "Booking status updated successfully",
  });
});

export const getBookingById = catchAsync(async (req: AuthRequest, res: Response) => {
  const booking = await GetBookingByIdService(req.params.id as string, req.user!.id, req.user!.role);
  res.status(200).json({ status: "success", data: { booking } });
});

export const getDashboardStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await GetDashboardStatsService(req.user!.id, req.user!.role);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});
