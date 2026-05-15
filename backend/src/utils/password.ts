import bcrypt from "bcryptjs";
import crypto from "crypto";
import logger from "../config/winston";

/*
 * Hashing user password
 */
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/*
 * Comparing User password
 */
export const ComparePassword = async (
  plainPassword: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashPassword);
};

/**
 * Check if user changed password
 */
export const changePasswordAfter = (
  passwordChangedAt: Date | null,
  JWTTimestamp: number,
): boolean => {
  logger.info("Checking if password was changed after the token was issued");
  if (!passwordChangedAt) return false;

  const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);

  logger.info("Password change check completed");
  return JWTTimestamp < changedTimestamp;
};

/**
 * Create Password Reset token
 */
export const createPasswordResetToken = () => {
  logger.info("Creating password reset token");
  const passwordResetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token
  const resetToken = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");

  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  logger.info("Password reset token created successfully");
  return {
    passwordResetToken,
    resetToken,
    resetTokenExpiry,
  };
};

/**
 * Hash a Reset token
 */
export const hashResetToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
