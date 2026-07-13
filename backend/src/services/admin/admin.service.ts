import { prisma } from "../../config/database";
import AppError from "../../utils/AppError";
import { SignupInput } from "../../schema/auth.schema";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import logger from "../../config/winston";
import { hashPassword } from "../../utils/password";
import config from "../../config/config.env";
import { REFRESH_TOKEN_TTL_MS } from "../../config/constants";

/**
 * Admin Sign Up
 */

export const adminSignupService = async (data: SignupInput, adminSecret: string) => {
  if (!config.ADMIN_SIGNUP_SECRET || adminSecret !== config.ADMIN_SIGNUP_SECRET) {
    throw new AppError("Invalid admin secret", 403);
  }

  // Check if Admin exist with the email
  const existingAdmin = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingAdmin) {
    logger.info(`Admin with this Email already in user Email: ${existingAdmin}`);
    throw new AppError("Admin already exist", 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create Admin
  const newAdmin = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: "admin",
      isVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
    },
  });

  /**
   * Generate Access And Refresh Token
   */
  const payload = { id: newAdmin.id, role: newAdmin.role };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  /*
   * Save Refresh Token into DB
   */
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newAdmin.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { newAdmin, accessToken, refreshToken };
};
