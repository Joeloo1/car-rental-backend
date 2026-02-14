import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config.env";
import { UserRole } from "@prisma/client";

interface TokenPayload extends JwtPayload {
  email: string;
}

/**
 * Generate Access Token
 */

export const generateAccessToken = async (payload: {
  id: string;
  role: UserRole;
}): Promise<string> => {
  // Put payload fields at the top level, not nested
  return jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = async (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = async (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_TOKEN_SECRET);
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = async (payload: {
  id: string;
  role: UserRole;
}): Promise<string> => {
  return jwt.sign({ payload }, config.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Generate Email Verification Token
 */
export const generateVerificationToken = (email: string): string => {
  return jwt.sign({ email }, config.VERIFICATION_SECRET, {
    expiresIn: "2h",
  });
};

/**
 * Verify Email Token
 */
export const verifyEmailToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, config.VERIFICATION_SECRET) as TokenPayload;
  return decoded;
};
