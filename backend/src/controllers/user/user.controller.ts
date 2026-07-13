import { Response, NextFunction } from "express";
import {
  uploadProfileImageService,
  updateUserService,
  GetUserService,
  deleteUserService,
  upgradeToLenderService,
  ChangePasswordService,
} from "../../services/user/user.service";
import { GetMyReviewsService } from "../../services/review.service";
import logger from "../../config/winston";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import { filterObj } from "../../utils/filterObj";
import { updateUserSchema } from "../../schema/user/user.schema";
import { AuthRequest } from "../../types/authRequest";

// Update User
export const updateUser = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Block Password update on this route
    if (req.body.Password || req.body.passwordConfirm) {
      logger.warn("User attempt to update password with update User routes");
      return next(
        new AppError("This route is not for password Update, Please use the /updatePassword", 400),
      );
    }

    const userData = updateUserSchema.parse(req.body);

    const filteredBody = filterObj(userData, "name", "email", "phoneNumber");

    // Upload new profile image to Cloudinary if provided
    if (req.file) {
      logger.info(`Uploading profile image for user: ${req.user!.id}`);

      const { imageUrl, publicId } = await uploadProfileImageService(
        req.file.buffer,
        req.user!.id,
        req.user!.profileImagePublicId,
      );

      filteredBody.profileImage = imageUrl;
      filteredBody.profileImagePublicId = publicId;
    }
    // Ensuring at least one field is provided
    if (Object.keys(filteredBody).length === 0) {
      logger.warn("No valid fields provided for user update");
      return next(
        new AppError(
          "Provide at least one valid field to update (name, email, phoneNumber, profileImage).",
          400,
        ),
      );
    }

    logger.info(`User with ID: ${req.user!.id} is updating their profile`);
    const updateUser = await updateUserService(req.user!.id, filteredBody);

    logger.info(`User with ID: ${req.user!.id} updated successfully`);

    res.status(200).json({
      status: "success",
      message: "User Updated successfully",
      data: {
        updateUser,
      },
    });
  },
);

// Get user
export const getUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await GetUserService(req.user!.id);

  logger.info(`User getting there profile UserID: ${req.user!.id}`);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

// Upgrade current user from User → lender
export const upgradeToLender = catchAsync(async (req: AuthRequest, res: Response) => {
  const updated = await upgradeToLenderService(req.user!.id);
  logger.info(`User ${req.user!.id} upgraded to lender`);
  res.status(200).json({
    status: "success",
    message: "Your account has been upgraded to Lender. You can now list cars.",
    data: { user: updated },
  });
});

// Change password
export const changePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return next(new AppError("currentPassword and newPassword are required", 400));
  }
  if (newPassword.length < 8) {
    return next(new AppError("New password must be at least 8 characters", 400));
  }

  await ChangePasswordService(req.user!.id, currentPassword, newPassword);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully. Please log in again.",
  });
});

// Get my reviews
export const getMyReviews = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const result = await GetMyReviewsService(req.user!.id, page, limit);
  res.status(200).json({ status: "success", data: result });
});

// delete user
export const deleteUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await deleteUserService(req.user!.id);

    logger.info(`User with ID: ${req.user!.id} successfully deactivated their account`);

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully",
      data: null,
    });
  },
);

import { Request } from "express";
import { prisma } from "../../config/database";

export const getPublicLenderProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const [lenderBase, totalCars, completedTrips] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: "lender" },
      select: { id: true, name: true, profileImage: true, createdAt: true },
    }),
    prisma.car.count({ where: { lenderId: id } }),
    prisma.booking.count({ where: { car: { lenderId: id }, status: "completed" } }),
  ]);

  if (!lenderBase) throw new AppError("Lender not found", 404);

  res.status(200).json({
    status: "success",
    data: { lender: { ...lenderBase, totalCars, completedTrips } },
  });
});
