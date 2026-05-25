import { Request, Response, NextFunction } from "express";
import { adminSignupService } from "../../services/admin/admin.service";
import catchAsync from "../../utils/catchAsync";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import config from "../../config/config.env";

// Admin signup — protected by ADMIN_SIGNUP_SECRET env var
export const adminSignup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { adminSecret, ...rest } = req.body;

  if (!config.ADMIN_SIGNUP_SECRET || adminSecret !== config.ADMIN_SIGNUP_SECRET) {
    return next(new AppError("Invalid admin secret", 403));
  }

  const { newAdmin, accessToken, refreshToken } = await adminSignupService(rest);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info(`Admin with email: ${newAdmin.email} signing up`);
  res.status(201).json({
    status: "success",
    data: { newAdmin },
    token: { accessToken },
  });
});
