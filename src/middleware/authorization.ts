import { Request, Response, NextFunction } from "express";
import logger from "../config/winston";
import AppError from "../utils/AppError";

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      logger.warn("Forbidden access attempt - insufficient permissions", {
        userId: req.user.id,
        requiredRoles: roles,
      });
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
