import { prisma } from "../../config/database";
import AppError from "../../utils/AppError";
import logger from "../../config/winston";
import { deleteCache } from "../../config/redis";
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
import { getVerificationEmailHtml, generatePasswordResetEmail } from "../../utils/email";
import { dispatchEmail } from "../../workers/email.worker";
import config from "../../config/config.env";
import { UserRole } from "../../generated/prisma/client";
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

  const role = UserRole.User;

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

  const verifyUrl = `${config.SERVER_URL}/api/v1/auth/verify-email?token=${verificationToken}`;

  await dispatchEmail({
    email: newUser.email,
    subject: "Verify Your Email Address",
    html: getVerificationEmailHtml(verifyUrl, newUser.name),
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

  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    logger.warn(`Verification token expired for user: ${user.email}`);
    throw new AppError("Verification link has expired. Please request a new one.", 400);
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

  const verifyUrl = `${config.SERVER_URL}/api/v1/auth/verify-email?token=${verificationToken}`;

  await dispatchEmail({
    email: user.email,
    subject: "Verify your email",
    html: getVerificationEmailHtml(verifyUrl, user.name),
  });
  logger.info(`Verification email queued for ${user.email}`);
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

  // Google OAuth users have no password
  if (!user.passwordHash) {
    throw new AppError(
      "This account uses Google sign-in. Please use the Google button to log in.",
      400,
    );
  }

  // Block deactivated accounts before any expensive password check
  if (user.accountStatus !== "active") {
    logger.warn(`Login attempt on deactivated account: ${email}`);
    throw new AppError("Your account has been deactivated. Contact support.", 403);
  }

  // Compare the passwords
  const isValid = await ComparePassword(password, user.passwordHash);
  if (!isValid) {
    logger.warn(`Incorrect password attempt for email: ${email}`);
    throw new AppError("Invalid email or password", 401);
  }

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    role: user.role,
    isVerified: user.isVerified,
  };

  // Generate accessToken and refreshToken

  const payload = { id: user.id, role: user.role };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  /*
   * Save Refresh Token into DB
   */

  await prisma.refreshToken.create({
    data: {
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
  if (user.passwordResetTokenExpiry && user.passwordResetTokenExpiry > new Date()) {
    const timeRemaining = Math.ceil((user.passwordResetTokenExpiry.getTime() - Date.now()) / 60000);
    logger.warn(`Password reset rate limit hit for email: ${email}`);
    throw new AppError(
      `A password reset link was already sent. Please wait ${timeRemaining} minute(s) before requesting again.`,
      429,
    );
  }

  // Generate password reset token
  const { passwordResetToken, resetToken, resetTokenExpiry } = createPasswordResetToken();

  // save the hashed token to database
  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry,
    },
  });

  const resetURL = `${config.CLIENT_URL}/reset-password/${passwordResetToken}`;

  try {
    await dispatchEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      html: generatePasswordResetEmail(resetURL, user.email),
    });

    logger.info("Password reset email queued", { email, userId: user.id });
    return { message: "Password reset link has been sent to your email" };
  } catch (err) {
    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: null, passwordResetTokenExpiry: null },
    });

    logger.error("Error queuing password reset email", { email, error: err });
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
  // Validates password match (Zod ResetPasswordSchema also validates strength + match at the route level)
  if (newPassword !== passwordConfirm) {
    logger.warn("passwords do not match");
    throw new AppError("Passwords do not match", 400);
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

  await deleteCache(`auth:user:${user.id}`);

  logger.info("Password reset successful", { userId: user.id });

  return {
    message: "Password reset successful. You can now login with your new password.",
  };
};

/**
 *  Log Out
 */
export const logOutService = async (userId: string, refreshToken: string | null) => {
  await prisma.refreshToken.deleteMany({
    where: refreshToken ? { userId, token: refreshToken } : { userId },
  });

  // Evict the auth cache immediately so revoked sessions can't use the 60s window
  await deleteCache(`auth:user:${userId}`);

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

  // Rotate: issue new access + refresh token, revoke the old one
  const payload = { id: storedToken.user.id, role: storedToken.user.role };

  const [newAccessToken, newRefreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  // deleteMany (not delete) so a React StrictMode double-fire or any concurrent
  // request using the same cookie doesn't throw "record not found for delete".
  const { count } = await prisma.refreshToken.deleteMany({ where: { id: storedToken.id } });
  if (count === 0) {
    // Token was already rotated by a concurrent request — treat as invalid
    throw new AppError("Invalid refresh token", 401);
  }
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info(`Tokens rotated for user: ${storedToken.user.id}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: storedToken.user.id,
      name: storedToken.user.name,
      email: storedToken.user.email,
      role: storedToken.user.role,
      isVerified: storedToken.user.isVerified,
    },
  };
};
