import path from "node:path";
import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/AppError";
import logger from "../config/winston";

/**
 * RESIZE MIDDLEWARE
 */
export const resizePhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    if (!req.user || !req.user.id) {
      logger.warn("User not authenticated for photo upload");
      return next(new AppError("User not authenticated", 401));
    }

    logger.info(`Resizing user photo User: ${req.user.id}`);

    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    const uploadDir = path.join(__dirname, "../../public/users/img/users");
    const filePath = path.join(uploadDir, filename);

    // RESIZE AND SAVE IMAGE
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(filePath);

    req.file.filename = filename;

    next();
  },
);
