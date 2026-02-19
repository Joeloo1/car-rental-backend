import { prisma } from "../../config/database";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import { UpdateUserInput } from "../../schema/user/user.schema";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";

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
          { wigth: 300, heght: 300, crop: "fill", gravity: "face" },
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
  data: UpdateUserInput,
) => {
  // Chect is the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.warn("There is no user with the ID", { userId });
    throw new AppError("User not found", 404);
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
  // Chect is the user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  return await prisma.user.update({
    where: { id: userId },
    data: { active: false },
  });
};
