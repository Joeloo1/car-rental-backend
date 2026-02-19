import { Request, Response, NextFunction } from "express";
import catchAsync from "../../utils/catchAsync";
import {
  GetAllUserService,
  GetUserByIdService,
  AdminUpdateUserService,
  DeleteUserService,
} from "../../services/admin/admin.user.service";
import logger from "../../config/winston";

// Get All user
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await GetAllUserService();

    logger.info("Fetching all users", { users });
    res.status(200).json({
      status: "success",
      result: users.length,
      data: { users },
    });
  },
);

// Create user
export const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.error("Attempt to create user via undefined route");
    res.status(500).json({
      status: "error",
      message: "This route is not defined! Please use /signup instead",
    });
  },
);

// Get User by ID
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await GetUserByIdService(req.params.id as string);

    logger.info(`Fetching User with ID: ${user.id}`);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

// Update user
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await AdminUpdateUserService(
      req.params.id as string,
      req.body,
    );

    logger.info(`Updating user with ID: ${user.id}`);
    res.status(200).json({
      status: "success",
      message: "User Updated successfully",
      data: { user },
    });
  },
);

// Delete User
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await DeleteUserService(req.params.id as string);

    logger.info(`User with ID ${req.user.id} deleted successfully`);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  },
);
