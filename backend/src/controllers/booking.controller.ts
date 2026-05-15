import { Response } from "express";
import catchAsync from "../utils/catchAsync";
import { AuthRequest } from "../types/authRequest";
import {
  CreateBookingService,
  GetUserBookingsService,
  GetLenderBookingsService,
  UpdateBookingStatusService,
  GetDashboardStatsService,
} from "../services/booking.service";
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
} from "../schema/booking.schema";

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
  const bookings = await GetUserBookingsService(req.user!.id);

  res.status(200).json({
    status: "success",
    data: { bookings },
  });
});

export const getLenderBookings = catchAsync(async (req: AuthRequest, res: Response) => {
  const bookings = await GetLenderBookingsService(req.user!.id);

  res.status(200).json({
    status: "success",
    data: { bookings },
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

export const getDashboardStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await GetDashboardStatsService(req.user!.id, req.user!.role);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});
