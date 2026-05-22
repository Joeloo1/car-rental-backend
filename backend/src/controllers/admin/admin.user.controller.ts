import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  GetAllUserService,
  GetUserByIdService,
  AdminUpdateUserService,
  // DeleteUserService,
} from "../../services/admin/admin.user.service";
import logger from "../../config/winston";
import { AuthRequest } from "../../types/authRequest";

// Get All user
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await GetAllUserService(page, limit);

  logger.info("Fetching all users");
  res.status(200).json({
    status: "success",
    result: result.users.length,
    data: {
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    },
  });
});

// Create user
export const createUser = catchAsync(async (_req: Request, res: Response) => {
  logger.error("Attempt to create user via undefined route");
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
});

// Get User by ID
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await GetUserByIdService(req.params.id as string);

  logger.info(`Fetching User with ID: ${user.id}`);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// Update user
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await AdminUpdateUserService(req.params.id as string, req.body);

  logger.info(`Updating user with ID: ${user.id}`);
  res.status(200).json({
    status: "success",
    message: "User Updated successfully",
    data: { user },
  });
});

// Delete User
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  logger.info(`User with ID ${req.user!.id} deleted successfully`);
  logger.info(`User with ID ${req.user!.id} deleted successfully`);
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

