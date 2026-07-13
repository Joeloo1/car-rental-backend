import { Request, Response, NextFunction } from "express";
import { adminSignupService } from "../../services/admin/admin.service";
import catchAsync from "../../utils/catchAsync";
import logger from "../../config/winston";
import config from "../../config/config.env";
import { REFRESH_TOKEN_TTL_MS } from "../../config/constants";

// Admin signup — protected by ADMIN_SIGNUP_SECRET env var (secret validated in service)
export const adminSignup = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { adminSecret, ...rest } = req.body;

  const { newAdmin, accessToken, refreshToken } = await adminSignupService(rest, adminSecret ?? "");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  logger.info(`Admin with email: ${newAdmin.email} signing up`);
  res.status(201).json({
    status: "success",
    data: { newAdmin },
    token: { accessToken },
  });
});
