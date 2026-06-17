import { prisma } from "../../config/database";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import { UpdateUserInput } from "../../schema/user/user.schema";
import cloudinary from "../../config/cloudinary";
import { AccountStatus, UserRole } from "../../generated/prisma/client";
import { Readable } from "stream";
import { fa } from "zod/v4/locales";
import { deleteCache } from "@/config/redis";

const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const uploadProfileImageService = async (
  buffer: Buffer,
  userId: string,
  oldPublicId?: string | null,
): Promise<{ imageUrl: string; publicId: string }> => {
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      logger.error(`Failed to delete old profile Image: ${oldPublicId}`);
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "users/profiles",
        public_id: `user_${userId}`,
        resource_type: "image",
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            imageUrl: result!.secure_url,
            publicId: result!.public_id,
          });
      },
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};
/**
 * Updates an authenticated user's profile information
 */
export const updateUserService = async (
  userId: string,
  data: Partial<UpdateUserInput>,
  profileImage?: string,
) => {
  // Check is the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.warn("There is no user with the ID", { userId });
    throw new AppError("User not found", 404);
  }

  if (profileImage) {
    data.profileImage = profileImage;
  }

  // Update user
  const updateUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      passwordHash: false,
    },
  });

  return updateUser;
};

/**
 * Get user
 */
export const GetUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      role: true,
      provider: true,
      isVerified: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    logger.warn("There is no user with the ID", { userId });
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Delete user
 */
export const deleteUserService = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: AccountStatus.deleted, active: false },
  });

  await prisma.refreshToken.deleteMany({ where: { userId } });
  await deleteCache(`auth:user:${userId}`);
};

/**
 * Upgrade User → lender
 */
export const upgradeToLenderService = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === UserRole.lender) throw new AppError("Account is already a lender", 400);
  if (user.role === UserRole.admin) throw new AppError("Admin accounts cannot be changed", 400);

  return await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.lender },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      phoneNumber: true,
      isVerified: true,
    },
  });
};
