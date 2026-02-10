import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config.env";

interface TokenPayload extends JwtPayload {
  email: string;
}

/**
 * Generate Access Token
 */
export const generateAccessToken = async (userId: string): Promise<string> => {
  return jwt.sign({ id: userId }, config.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = async (userId: string): Promise<string> => {
  return jwt.sign({ id: userId }, config.JWT_REFRESH_TOKEN_SECRET, {
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
