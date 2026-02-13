import { prisma } from "../../config/database";
import AppError from "../../utils/AppError";
import { SignupInput } from "../../schema/auth.schema";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import logger from "../../config/winston";
import { hashPassword } from "../../utils/password";

/**
 * Admin Sign Up
 */

export const adminSignupService = async (data: SignupInput) => {
  // Check if Admin exist with the email
  const existingAdmin = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingAdmin) {
    logger.info(`Admm with this Email already in user Email: ${existingAdmin}`);
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { newAdmin, accessToken, refreshToken };
};
