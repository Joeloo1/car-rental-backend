import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import catchAsync from "../utils/catchAsync";
import {
  CreateCarService,
  UpdateCarService,
  GetAllCarsService,
  GetCarByIdService,
  UpdateCarStatusService,
  deleteCarService,
  GetCarsByLenderService,
  CheckCarAvailabilityService,
  SearchCarsService,
} from "../services/car.service";
import { CarQuerySchema, CarStatusEnum } from "../schema/car.schema";
import { AuthRequest } from "../types/authRequest";

// create car
export const createCar = catchAsync(async (req: AuthRequest, res: Response) => {
  const car = await CreateCarService(req.body, req.user!);

  res.status(201).json({
    status: "success",
    message: "Car created successfully",
    data: {
      car,
    },
  });
});

// Get all Cars
export const getAllCars = catchAsync(async (req: Request, res: Response) => {
  const { query } = CarQuerySchema.parse({ query: req.query });
  const result = await GetAllCarsService(query);

  res.status(200).json({
    status: "success",
    data: {
      cars: result.data,
      pagination: result.pagination,
    },
  });
});

// Get By ID
export const getCarById = catchAsync(async (req: Request, res: Response) => {
  const car = await GetCarByIdService(req.params.id as string);

  res.status(200).json({
    status: "success",
    data: { car },
  });
});

// Get Cars By Lenders
export const getCarByLender = catchAsync(async (req: Request, res: Response) => {
  const cars = await GetCarsByLenderService(req.params.id as string);

  res.status(200).json({
    status: "success",
    data: { cars },
  });
});

// Update Cars
export const updateCars = catchAsync(async (req: AuthRequest, res: Response) => {
  const car = await UpdateCarService(req.params.id as string, req.body, req.user!);

  res.status(200).json({
    status: "success",
    data: { car },
  });
});

// Update car status
export const updateCarStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const { availabilityStatus } = z.object({ availabilityStatus: CarStatusEnum }).parse(req.body);
  const isAdmin = req.user!.role === "admin";
  const car = await UpdateCarStatusService(
    req.params.id as string,
    availabilityStatus,
    req.user!.id,
    isAdmin,
  );

  res.status(200).json({
    status: "success",
    message: "Car Status updated successfully",
    data: { car },
  });
});

// Search autocomplete
export const searchCars = catchAsync(async (req: Request, res: Response) => {
  const q = (req.query.q as string) ?? "";
  const result = await SearchCarsService(q);
  res.status(200).json({ status: "success", data: result });
});

// Check car availability for given dates
export const checkCarAvailability = catchAsync(async (req: Request, res: Response) => {
  const carId = req.params.id as string;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  if (!startDate || !endDate) {
    res.status(400).json({ status: "fail", message: "startDate and endDate query params are required" });
    return;
  }

  const result = await CheckCarAvailabilityService(carId, startDate, endDate);
  res.status(200).json({ status: "success", data: result });
});

// Delete car
export const deleteCar = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === "admin";
  await deleteCarService(req.params.id as string, req.user!.id, isAdmin);

  res.status(200).json({
    status: "success",
    message: "Car deleted successfully",
  });
});
