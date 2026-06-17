import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import catchAsync from "../utils/catchAsync";
import logger from "../config/winston";
import AppError from "../utils/AppError";
import { Jwtpayload } from "../types/auth.types";
import { verifyAccessToken } from "../utils/jwt";
import { changePasswordAfter } from "../utils/password";
import { getCache, setCache } from "../config/redis";
import { AccountStatus, Provider, UserRole } from "../generated/prisma/client";

const TTL_AUTH_USER = 300; // 5 minutes — safe because logout/ban calls deleteCache immediately

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  profileImage: string;
  profileImagePublicId: string | null;
  passwordChangedAt: Date | null;
  isVerified: boolean;
  phoneNumber: string | null;
  provider: Provider | null;
  createdAt: Date;
  updatedAt: Date;
};

type CachedAuthUser = Omit<AuthUser, "passwordChangedAt" | "createdAt" | "updatedAt"> & {
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Protect Middleware
 */
export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  // Check if token exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.warn("Unauthorized access attempt - no token provided", {
      ip: req.ip,
      path: req.path,
    });
    return next(new AppError("you are not logged in, please login again", 401));
  }

  // verify Access Token
  const decoded = (await verifyAccessToken(token)) as Jwtpayload;

  if (!decoded.id) {
    logger.warn("Invalid token - missing user ID", { token });
    return next(new AppError("Invalid token, please log in again", 401));
  }

  const cacheKey = `auth:user:${decoded.id}`;

  let currentUser: AuthUser | null = null;
  const cached = await getCache<CachedAuthUser>(cacheKey);

  if (cached) {
    currentUser = {
      ...cached,
      passwordChangedAt: cached.passwordChangedAt ? new Date(cached.passwordChangedAt) : null,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
    };
    logger.info(`Auth cache HIT: ${cacheKey}`);
  } else {
    currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        profileImage: true,
        profileImagePublicId: true,
        passwordChangedAt: true,
        isVerified: true,
        phoneNumber: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (currentUser) {
      await setCache(cacheKey, currentUser, TTL_AUTH_USER);
    }
  }

  if (!currentUser) {
    logger.warn("Unauthorized access attempt - user no longer exists", {
      userId: decoded.id,
    });
    return next(new AppError("User belonging to this token no longer exists", 401));
  }

  if (currentUser.accountStatus !== AccountStatus.active) {
    return next(
      new AppError(
        `Your account is ${currentUser.accountStatus}. Please contact support.`,
        403,
      ),
    );
  }

  if (changePasswordAfter(currentUser.passwordChangedAt, decoded.iat)) {
    // check if user changed password after token was issued
    logger.warn("Unauthorized access attempt - password changed after token issued", {
      userId: currentUser.id,
    });
    return next(new AppError("You recently changed password, please log in again", 401));
  }
  req.user = currentUser;
  next();
});
