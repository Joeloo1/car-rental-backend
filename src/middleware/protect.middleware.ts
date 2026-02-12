import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import catchAsync from "../utils/catchAsync";
import logger from "../config/winston";
import AppError from "../utils/AppError";
import { Jwtpayload } from "../types/auth.types";
import { verifyAccessToken } from "../utils/jwt";
import { changePasswordAfter } from "../utils/password";

/**
 * Protect Middleware
 */
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      logger.warn("Unauthorized access attempt - no token provided", {
        ip: req.ip,
        path: req.path,
      });
      return next(
        new AppError("you are not logged in, please login again", 401),
      );
    }

    // verify Access Token
    const decoded = (await verifyAccessToken(token)) as Jwtpayload;
    console.log("Decoded token:", decoded);

    if (!decoded.id) {
      logger.warn("Invalid token - missing user ID", { token });
      return next(new AppError("Invalid token, please log in again", 401));
    }

    // Check if user exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      logger.warn("Unauthorized access attempt - user no longer exists", {
        userId: decoded.id,
      });
      return next(
        new AppError("User belonging to this token no longer exists", 401),
      );
    }

    // check if user changed password after token was issued
    if (changePasswordAfter(currentUser.passwordChangedAt, decoded.iat)) {
      logger.warn(
        "Unauthorized access attempt - password changed after token issued",
        { userId: currentUser.id },
      );
      return next(
        new AppError("You recently changed password, please log in again", 401),
      );
    }
    req.user = currentUser;
    next();
  },
);
