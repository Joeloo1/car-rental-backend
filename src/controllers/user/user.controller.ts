import { Request, Response, NextFunction } from "express";
import {
  uploadProfileImageService,
  updateUserService,
  GetUserService,
  deleteUserService,
} from "../../services/user/user.service";
import logger from "../../config/winston";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppError";
import { filterObj } from "../../utils/filterObj";
import { updateUserSchema } from "../../schema/user/user.schema";

// Update User
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Block Password update on this route
    if (req.body.Password || req.body.passwordConfirm) {
      logger.warn("User attempt to update password with update User routes");
      return next(
        new AppError(
          "This route is not for password Update, Please use the /updatePassword",
          400,
        ),
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

    logger.info(`User with ID: ${req.user.id} is updating their profile`);
    const updateUser = await updateUserService(req.user.id, filteredBody);

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
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await GetUserService(req.user.id);

    logger.info(`User getting there profile UserID: ${req.user.id}`);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

// delete user
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await deleteUserService(req.user.id);

    if (!user) {
      logger.warn(`user with ID:${req.user!.id} not found`);
      return next(new AppError("User not found", 404));
    }

    logger.info(
      `User with ID: ${req.user!.id} successfully deactivated their account`,
    );

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully",
      data: null,
    });
  },
);
