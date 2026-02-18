import { prisma } from "../../config/database";
import AppError from "../../utils/AppError";
import logger from "../../config/winston";
import { LoginInput, SignupInput } from "../../schema/auth.schema";
import {
  hashPassword,
  ComparePassword,
  createPasswordResetToken,
  hashResetToken,
} from "../../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyEmailToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import {
  sendEmail,
  getVerificationEmailHtml,
  generatePasswordResetEmail,
} from "../../utils/email";
import config from "../../config/config.env";
import { Jwtpayload } from "../../types/auth.types";
import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

/**
 * USER SIGN UP
 */

export const signupService = async (data: SignupInput) => {
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

  const role = data.role === "lender" ? UserRole.lender : UserRole.User;

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role,
      verifyToken: verificationToken,
      verifyTokenExpiry: verificationExpiry,
      accountStatus: "active",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phoneNumber: true,
      isVerified: true,
    },
  });

  const verifyUrl = `${config.CLIENT_URL}/api/auth/verify-email?token=${verificationToken}`;

  sendEmail({
    email: newUser.email,
    subject: "Verify Your Email Address",
    html: getVerificationEmailHtml(verifyUrl, newUser.name),
  })
    .then(() => {
      logger.info("Verification email sent successfully", {
        userId: newUser.id,
        email: newUser.email,
      });
    })
    .catch((error) => {
      logger.error("Failed to send verification email", {
        userId: newUser.id,
        email: newUser.email,
        error: error.message,
      });
      // Optional: Queue for retry or notify admin
      // emailQueue.add({ userId: newUser.id, type: 'verification' });
    });

  // Generate accessToken and refreshToken
  const payload = { id: newUser.id, role: newUser.role };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

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
    html: getVerificationEmailHtml(verifyUrl, user.name),
  });
  logger.info(`Verification email resent to ${user.email}`);
};

/**
 * Log In
 */

export const loginService = async (data: LoginInput) => {
  const { email, password } = data;

  // Check if email and password field if provided
  if (!email || !password) {
    logger.warn("User tried to login with empty field");
    throw new AppError("Please provide email and password", 400);
  }
  // Check if the email exist in DB
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    logger.warn(`User with email: ${email} not found`);
    throw new AppError("Invalid email or password", 401);
  }

  // Compare the passwords
  const isValid = await ComparePassword(password, user.passwordHash);
  if (!isValid) {
    logger.warn(`Incorrect password attempt for email: ${email}`);
    throw new AppError("Invalid email or password", 401);
  }

  // Check if the user is verified
  if (!user.isVerified && user.role !== "admin") {
    logger.warn(`User with email: ${user.email} hasn't verified their email`);
    throw new AppError("Please verify your email first", 403);
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    role: user.role,
  };

  // Generate accessToken and refreshToken

  const payload = { id: user.id, role: user.role };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  /*
   * Save Refresh Token into DB
   */

  await prisma.refreshToken.upsert({
    where: { userId: user.id },
    update: {
      token: refreshToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { sanitizedUser, accessToken, refreshToken };
};

/**
 * Forgot Password Service
 * Generates and sends a password reset token to the user's email
 */
export const forgotPasswordServices = async (email: string) => {
  // Check if user exist
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn(`User with email: ${email} not found`);
    return {
      message: "If that email exists, a password reset link has been sent",
    };
  }

  // Check if a recent reset token was already sent (rate limiting)
  if (
    user.passwordResetTokenExpiry &&
    user.passwordResetTokenExpiry > new Date()
  ) {
    const timeRemaining = Math.ceil(
      (user.passwordResetTokenExpiry.getTime() - Date.now()) / 60000,
    );
    logger.warn(`Password reset rate limit hit for email: ${email}`);
    throw new AppError(
      `A password reset link was already sent. Please wait ${timeRemaining} minute(s) before requesting again.`,
      429,
    );
  }

  // Generate password reset token
  const { passwordResetToken, resetToken, resetTokenExpiry } =
    createPasswordResetToken();

  // save the hased token to database
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry,
    },
  });

  const resetURL = `${config.CLIENT_URL}/api/auth/reset-password/${passwordResetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      html: generatePasswordResetEmail(resetURL, user.email),
    });

    logger.info("Password reset token sent successfully", {
      email,
      userId: user.id,
    });
    return { message: "Password reset link has been sent to your email" };
  } catch (err) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    logger.error("Error sending password reset email", { email, error: err });
    throw new AppError("Error sending email. Please try again later.", 500);
  }
};

/**
 * Reset Password Service
 * Validates token and updates user password
 */

export const resetPasswordService = async (
  token: string,
  newPassword: string,
  passwordConfirm: string,
) => {
  // Validates password match
  if (newPassword !== passwordConfirm) {
    logger.warn("passwords do not match");
    throw new AppError("Password do not match", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  // Hash the token
  const hashedToken = hashResetToken(token);

  // find the user
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    logger.warn("Invalid or expired reset token attempted");
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Hash new passwords
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      passwordChangedAt: new Date(),
    },
  });

  logger.info("Password reset successful", { userId: user.id });

  return {
    message:
      "Password reset successful. You can now login with your new password.",
  };
};

/**
 *  Log Out
 */
export const logOutService = async (userId: string, refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      token: refreshToken,
    },
  });

  logger.info(`User logged out: ${userId}`);
};

/**
 * Refresh Access Token
 */
export const refreshAccessTokenService = async (refreshToken: string) => {
  let decoded: JwtPayload;

  // 1️⃣ Verify token safely
  try {
    decoded = (await verifyRefreshToken(refreshToken)) as JwtPayload;
  } catch (err) {
    logger.warn(`Invalid refresh token attempted`);
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Check if refreshToken exist in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          isVerified: true,
        },
      },
    },
  });
  if (!storedToken) {
    logger.warn(`Refresh token not found in database: ${decoded.id}`);
    throw new AppError("Invalid refresh token", 401);
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    logger.warn(`Expired refresh token used: ${decoded.id}`);
    throw new AppError("Refresh token expired", 401);
  }

  // Check if user exists and is active
  if (!storedToken.user) {
    throw new AppError("User not found", 401);
  }

  if (storedToken.user.accountStatus !== "active") {
    throw new AppError("Account is not active", 403);
  }

  // Generate new access token
  const payload = { id: storedToken.user.id, role: storedToken.user.role };
  const newAccessToken = await generateAccessToken(payload);

  logger.info(`Access token refreshed for user: ${storedToken.user.id}`);

  return {
    accessToken: newAccessToken,
    user: {
      id: storedToken.user.id,
      name: storedToken.user.name,
      email: storedToken.user.email,
      role: storedToken.user.role,
      isVerified: storedToken.user.isVerified,
    },
  };
};
