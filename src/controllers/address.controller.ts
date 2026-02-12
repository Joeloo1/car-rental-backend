import { Request, Response } from "express";
import {
  CreateAddressService,
  UpdateAddressService,
  GetAllAddressService,
  GetAddressByIdService,
  DeleteAddressService,
} from "../services/address.service";
import catchAsync from "../utils/catchAsync";
import logger from "../config/winston";

// Create address
export const createAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await CreateAddressService(req.user.id, req.body);

  logger.info(`Creating address...`);
  res.status(201).json({
    status: "seccess",
    message: "Address created successfully",
    data: {
      address,
    },
  });
});

// Get all Address
export const getAllAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await GetAllAddressService(req.user.id);

  logger.info("User fetching all addresses");
  res.status(200).json({
    status: "success",
    result: address.length,
    data: {
      address,
    },
  });
});

// Get Address By ID
export const getAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await GetAddressByIdService(
    req.user.id,
    req.params.id as string,
  );

  logger.info(`Getting addressby ID: ${address.id}`);
  res.status(200).json({
    status: "success",
    data: {
      address,
    },
  });
});

// Update Address
export const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const address = await UpdateAddressService(
    req.user.id,
    req.params.id as string,
    req.body,
  );

  logger.info(
    `User with ID: ${address.userId} updating address with ID: ${address.id}`,
  );
  res.status(200).json({
    status: "success",
    message: "Address updated successfully",
    data: {
      address,
    },
  });
});

// Delete Address
export const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  await DeleteAddressService(req.user.id, req.params.id as string);

  logger.info("deleting address");
  res.status(200).json({
    status: "success",
    message: "Address deleted successfully",
  });
});
