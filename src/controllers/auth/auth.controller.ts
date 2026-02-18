import { NextFunction, Request, Response } from "express";
import {
  signupService,
  loginService,
  verifyEmailService,
  resendverifyEmailService,
  forgotPasswordServices,
  resetPasswordService,
  logOutService,
  refreshAccessTokenService,
} from "../../services/auth/auth.service";
import catchAsync from "../../utils/catchAsync";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import config from "../../config/config.env";

// signup
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { newUser, refreshToken, accessToken } = await signupService(req.body);

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info(`User with email: ${newUser.email} Signed Up successfully`);
  res.status(201).json({
    status: "success",
    message:
      "Account created successfully. Please check your email to verify your account.",
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

// Login
export const login = catchAsync(async (req: Request, res: Response) => {
  const { sanitizedUser, accessToken, refreshToken } = await loginService(
    req.body,
  );

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info(`User logged in successfully... Email:${sanitizedUser.email}`);
  res.status(200).json({
    status: "success",
    message: "User logged in Successfully",
    data: { sanitizedUser },
    tokens: { accessToken, refreshToken },
  });
});

// Forgot password
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      logger.warn("Email is required");
      return next(new AppError("Email is required", 400));
    }

    // Pass the URL to the service
    const result = await forgotPasswordServices(email);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);

// Reset Password
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    // Validation
    if (!token) {
      return next(new AppError("Reset token is required", 400));
    }

    if (!password || !passwordConfirm) {
      return next(
        new AppError("Please provide password and password confirmation", 400),
      );
    }

    const result = await resetPasswordService(
      token as string,
      password,
      passwordConfirm,
    );

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);

// log out
export const logOut = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
    return;
  }

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
    return;
  }

  await logOutService(userId, refreshToken);

  res.status(200).json({
    status: "success",
    message: "logged out successfully",
  });
});

// REFRESH ACCESS token
export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }
    const result = await refreshAccessTokenService(refreshToken);

    res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully",
      accessToken: result.accessToken,
      user: result.user,
    });
  },
);
