import { Request, Response } from "express";
import config from "../../config/config.env";
import { REFRESH_TOKEN_TTL_MS } from "../../config/constants";
import logger from "../../config/winston";
import catchAsync from "../../utils/catchAsync";
import { AuthRequest } from "../../types/authRequest";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { prisma } from "../../config/database";

export const googleAuthCallback = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    logger.warn("Google OAuth callback failed: No user in request");
    return res.redirect(`${config.CLIENT_URL}/login?error=authentication_failed`);
  }

  try {
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken({ id: user.id, role: user.role }),
      generateRefreshToken({ id: user.id, role: user.role }),
    ]);

    // Revoke all previous tokens then persist the new one
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax", // "lax" allows the cookie to be sent after cross-site OAuth redirects
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    // Set access token as a short-lived, JS-readable cookie so the frontend can
    // read it once and move it into memory — avoids putting it in the URL/history.
    res.cookie("oauthAccessToken", accessToken, {
      httpOnly: false,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 1000, // 60 seconds — just long enough for the redirect
    });

    logger.info("Google OAuth successful", { userId: user.id, email: user.email });

    res.redirect(`${config.CLIENT_URL}/auth-success`);
  } catch (error) {
    logger.error("Google OAuth token generation failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.redirect(`${config.CLIENT_URL}/login?error=token_generation_failed`);
  }
});

export const googleAuthFailure = (_req: Request, res: Response) => {
  logger.warn("Google OAuth authentication failed");
  res.redirect(`${config.CLIENT_URL}/login?error=google_auth_failed`);
};

export const getCurrentUser = catchAsync(async (req: AuthRequest, res: Response): Promise<any> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ status: "fail", message: "Not authenticated" });
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
