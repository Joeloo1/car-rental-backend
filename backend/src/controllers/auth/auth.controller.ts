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
import { AuthRequest } from "../../types/authRequest";
import { REFRESH_TOKEN_TTL_MS } from "../../config/constants";

// signup
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { newUser, refreshToken, accessToken } = await signupService(req.body);

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  logger.info(`User with email: ${newUser.email} Signed Up successfully`);
  res.status(201).json({
    status: "success",
    message: "Account created. Please check your email to verify your account before signing in.",
  });
});

// email verification — redirects to the frontend page so users see a real UI
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token as string;

  if (!token) {
    return res.redirect(`${config.CLIENT_URL}/verify-email-confirm?error=missing_token`);
  }

  try {
    await verifyEmailService(token);
    return res.redirect(`${config.CLIENT_URL}/verify-email-confirm?success=true`);
  } catch (err: any) {
    const code = err?.message?.includes("expired") ? "expired" : "invalid";
    return res.redirect(`${config.CLIENT_URL}/verify-email-confirm?error=${code}`);
  }
});

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
  const { sanitizedUser, accessToken, refreshToken } = await loginService(req.body);

  // Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  logger.info(`User logged in successfully... Email:${sanitizedUser.email}`);
  res.status(200).json({
    status: "success",
    message: "User logged in Successfully",
    data: { sanitizedUser },
    tokens: { accessToken },
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
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  // Validation
  if (!token) {
    return next(new AppError("Reset token is required", 400));
  }

  if (!password || !passwordConfirm) {
    return next(new AppError("Please provide password and password confirmation", 400));
  }

  const result = await resetPasswordService(token as string, password, passwordConfirm);

  res.status(200).json({
    status: "success",
    message: result.message,
  });
});

const REFRESH_COOKIE_OPTS = (isProd: boolean) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
});

// log out — revoke token in DB AND clear the cookie so the browser discards it
export const logOut = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  // Always use the cookie — ignoring body prevents an attacker from revoking a different token
  const refreshToken = req.cookies?.refreshToken ?? null;

  await logOutService(userId, refreshToken ?? null);

  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTS(config.NODE_ENV === "production"));

  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
});

// log out all devices — revoke every refresh token for this user
export const logOutAll = catchAsync(async (req: AuthRequest, res: Response) => {
  await logOutService(req.user!.id, null);

  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTS(config.NODE_ENV === "production"));

  res.status(200).json({
    status: "success",
    message: "Logged out from all devices.",
  });
});

// REFRESH ACCESS token
export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
    return;
  }
  const result = await refreshAccessTokenService(refreshToken);

  // Set the new rotated refresh token as an HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  res.status(200).json({
    status: "success",
    message: "Access token refreshed successfully",
    accessToken: result.accessToken,
    user: result.user,
  });
});
