import { Request, Response } from "express";
// import jwt from "jsonwebtoken";
import config from "../../config/config.env";
import logger from "../../config/winston";
import catchAsync from "../../utils/catchAsync";
import { AuthRequest } from "../../types/authRequest";
import { generateAccessToken } from "@/utils/jwt";

/**
 * Google OAuth Callback Handler
 * Called after successful Google authentication
 * Generates JWT tokens and returns user data
 */
export const googleAuthCallback = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    logger.warn("Google OAuth callback failed: No user in request");
    return res.redirect(`${config.CLIENT_URL}/login?error=authentication_failed`);
  }

  try {
    // // Generate JWT tokens
    // const accessToken = jwt.sign(
    //   {
    //     id: user.id,
    //     email: user.email,
    //     role: user.role,
    //   },
    //   config.JWT_ACCESS_TOKEN_SECRET,
    //   {
    //     expiresIn: String(config.ACCESS_TOKEN_EXPIRY),
    //   },
    // );
    //
    // const refreshToken = jwt.sign(
    //   {
    //     id: user.id,
    //   },
    //   config.JWT_REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: String(config.REFRESH_TOKEN_EXPIRY),
    //   },
    // );

    const accessToken = await generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = await generateAccessToken({
      id: user.id,
      role: user.role,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info("Google OAuth successful", {
      userId: user.id,
      email: user.email,
    });

    // Redirect to frontend with tokens
    res.redirect(
      `${config.CLIENT_URL}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}`,
    );
  } catch (error) {
    logger.error("Google OAuth token generation failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.redirect(`${config.CLIENT_URL}/login?error=token_generation_failed`);
  }
});

/**
 * Google OAuth Failure Handler
 * Called when Google authentication fails
 */
export const googleAuthFailure = (_req: Request, res: Response) => {
  logger.warn("Google OAuth authentication failed");
  res.redirect(`${config.CLIENT_URL}/login?error=google_auth_failed`);
};

/**
 * Get Current User
 * Returns the currently authenticated user
 */
export const getCurrentUser = catchAsync(async (req: AuthRequest, res: Response): Promise<any> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Not authenticated",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
      },
    },
  });
});
