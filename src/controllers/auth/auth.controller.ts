import { NextFunction, Request, Response } from "express";
import {
  signupService,
  verifyEmailService,
  resendverifyEmailService,
} from "../../services/auth/auth.service";
import catchAsync from "../../utils/catchAsync";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";

// signup
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { newUser, refreshToken, accessToken } = await signupService(req.body);

  logger.info(`User with email: ${newUser.email} Signed Up successfully`);
  res.status(201).json({
    statu: "success",
    data: { newUser },
    token: { refreshToken, accessToken },
  });
});

// email verification
export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;

    if (!token) {
      return next(new AppError("verification token missing", 400));
    }

    await verifyEmailService(token);

    res.status(200).json({
      message: "Email Verified Successfully",
    });
  },
);

// Re-send verification name
export const resendverifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      logger.warn("Email is required");
      return next(new AppError("Email is required", 400));
    }

    await resendverifyEmailService(email);

    res.status(200).json({
      message: "Verification email sent successfully",
    });
  },
);
