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
} from "../../utils/jwt";
import {
  sendEmail,
  getVerificationEmailHtml,
  generatePasswordResetEmail,
} from "../../utils/email";
import config from "../../config/config.env";

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

  const verifyUrl = `${config.CLIENT_URL}/api/auth/verify-email?token=${verificationToken}`;

  sendEmail({
    email: newUser.email,
    subject: "Verify Your Email Address",
    html: getVerificationEmailHtml(verifyUrl, newUser.firstName),
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
    html: getVerificationEmailHtml(verifyUrl, user.firstName),
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

  return { user, accessToken, refreshToken };
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
