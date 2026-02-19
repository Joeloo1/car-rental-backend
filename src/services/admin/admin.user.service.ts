import { prisma } from "../../config/database";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import { AdminUpdateUserInput } from "../../schema/user/user.schema";

/**
 * Get All Users Service
 */
export const GetAllUserService = async () => {
  const users = await prisma.user.findMany();

  return users;
};

/**
 * Get User By ID
 */
export const GetUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    logger.info("User not found", { userId });
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Update user
 */
export const AdminUpdateUserService = async (
  userId: string,
  data: AdminUpdateUserInput,
) => {
  // Ensure there is actually something to update
  if (!data || Object.keys(data).length === 0) {
    throw new AppError("No data provided for update", 400);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    logger.info("User not found", { userId });
    throw new AppError("User not found", 404);
  }

  const updateUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return updateUser;
};

/**
 * Delete  User
 */
export const DeleteUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    logger.info("User not found", { userId });
    throw new AppError("User not found", 404);
  }

  return await prisma.user.delete({
    where: { id: userId },
  });
};
