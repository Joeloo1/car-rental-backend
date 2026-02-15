import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import {
  CreateCarService,
  UpdateCarService,
  GetAllCarsService,
  GetCarByIdService,
  UpdateCarStatusService,
  deleteCarService,
  GetCarsByLenderService,
} from "../services/car.service";
import { CarQuerySchema } from "../schema/car.schema";

// create car
export const createCar = catchAsync(async (req: Request, res: Response) => {
  const car = await CreateCarService(req.body, req.user);

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
  const cars = await GetAllCarsService(query);

  res.status(200).json({
    status: "success",
    data: { cars },
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
export const getCarByLender = catchAsync(
  async (req: Request, res: Response) => {
    const cars = await GetCarsByLenderService(req.params.id as string);

    res.status(200).json({
      status: "success",
      data: { cars },
    });
  },
);

// Update Cars
export const updateCars = catchAsync(async (req: Request, res: Response) => {
  const car = await UpdateCarService(
    req.params.id as string,
    req.body,
    req.user as any,
  );

  res.status(200).json({
    status: "success",
    data: { car },
  });
});

// Update car status
export const updateCarStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { availabilityStatus } = req.body;
    const car = await UpdateCarStatusService(
      req.params.id as string,
      availabilityStatus,
      req.user.id,
    );

    res.status(200).json({
      status: "success",
      message: "Car Status updated successfully",
      data: { car },
    });
  },
);

// Delete car
export const deleteCar = catchAsync(async (req: Request, res: Response) => {
  await deleteCarService(req.params.id as string);

  res.status(200).json({
    status: "success",
    message: "Car deleted successfully",
  });
});
