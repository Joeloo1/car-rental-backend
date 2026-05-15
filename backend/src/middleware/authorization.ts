import { Response, NextFunction, RequestHandler } from "express";
import logger from "../config/winston";
import AppError from "../utils/AppError";
import { AuthRequest } from "../types/authRequest";
import { UserRole } from "../generated/prisma/enums";

export const restrictTo = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return next(new AppError("You are not logged in!", 401));
    }
    if (!roles.includes(authReq.user.role)) {
      logger.warn("Forbidden access attempt - insufficient permissions", {
        userId: authReq.user.id,
        requiredRoles: roles,
      });
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

// export const restrictTo =
//   (...roles: UserRole[]): RequestHandler =>
//   (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "You do not have permission to perform this action",
//       });
//     }
//
//     next();
//   };
//
//   // export const restrictTo =
//   (...roles: UserRole[]): RequestHandler =>
//   (req, _res, next) => {
//     const authReq = req as AuthRequest;
//
//     if (!authReq.user) {
//       return next(new AppError("You are not logged in!", 401));
//     }
//
//     if (!roles.includes(authReq.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action", 403),
//       );
//     }
//
//     next();
//   };
