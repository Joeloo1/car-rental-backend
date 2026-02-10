import { prisma } from "../../config/database";
import AppError from "../../utils/AppError";
import logger from "../../config/winston";
import { LoginSchema, SignupInput } from "../../schema/auth.schema";
import { hashPassword } from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyEmailToken,
} from "../../utils/jwt";
import { sendEmail, getVerificationEmailHtml } from "../../utils/email";
import config from "../../config/config.env";

/**
 * USER SIGN UP
 */

export const singupService = async (data: SignupInput) => {
  // Check if user exist
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    logger.info(`Email already in user Email: ${existingUser}`);
    throw new AppError("Email already in use", 400);
  }

  // hash password
  const hashedPassword = await hashPassword(data.password);

  // Generate Email Verification Token
  const verificationToken = generateVerificationToken(data.email);
  const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      firstName: data.firstName,
      email: data.email,
      passwordHash: hashedPassword,
      role: "User",
      verifyToken: verificationToken,
      verifyTokenExpiry: verificationExpiry,
    },
    select: {
      id: true,
      firstName: true,
      email: true,
      role: true,
      phoneNumber: true,
    },
  });

  // Send verification email
  const verifyUrl = `${config.CLIENT_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendEmail({
    email: newUser.email,
    subject: "Verify your email",
    html: getVerificationEmailHtml(verifyUrl),
  });

  // Generate accessToken and refreshToken
  const accessToken = await generateAccessToken(newUser.id);
  const refreshToken = await generateRefreshToken(newUser.id);

  /*
   * Save Refresh Token into DB
   */
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { newUser, accessToken, refreshToken };
};

/**
 * Verify Email
 */

export const verifyEmailService = async (token: string) => {
  const decoded = verifyEmailToken(token);

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
  });

  if (!user) {
    logger.warn(`User with email: ${decoded.email} not found`);
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    logger.warn(`User email: ${user.email} already verified`);
    throw new AppError("Email already verified", 400);
  }

  if (user.verifyToken !== token) {
    logger.warn("Invalid  or expired verification link");
    throw new AppError("Invalid  or expired verification link", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });
};

/**
 * Resend Email Verification Token
 */

export const resendverifyEmailService = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    logger.warn(`User with Email: ${email} not found`);
    throw new AppError("User not found", 404);
  }
  if (user.isVerified) {
    logger.warn(`User email: ${user.email} already verified`);
    throw new AppError("Email already verified", 400);
  }

  // Generate Email Verification Token
  const verificationToken = generateVerificationToken(user.email);
  const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyToken: verificationToken,
      verifyTokenExpiry: verificationExpiry,
    },
  });

  const clientUrl = config.CLIENT_URL;
  if (!clientUrl) {
    throw new Error("CLIENT_URL is not defined");
  }

  // Send verification email
  const verifyUrl = `${config.CLIENT_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendEmail({
    email: user.email,
    subject: "Verify your email",
    html: getVerificationEmailHtml(verifyUrl),
  });
  logger.info(`Verification email resent to ${user.email}`);
};
