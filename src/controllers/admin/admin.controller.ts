import { Request, Response, NextFunction } from "express";
import { adminSignupService } from "../../services/admin/admin.service";
import catchAsync from "../../utils/catchAsync";
import logger from "../../config/winston";

// Admin signup
export const adminSignup = catchAsync(async (req: Request, res: Response) => {
  const { newAdmin, refreshToken, accessToken } = await adminSignupService(
    req.body,
  );

  logger.info(`Admin with email: ${newAdmin.email} signing up`);
  res.status(201).json({
    status: "success",
    data: { newAdmin },
    token: { refreshToken, accessToken },
  });
});
