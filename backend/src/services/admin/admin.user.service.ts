import { prisma } from "../../config/database";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import { AdminUpdateUserInput } from "../../schema/user/user.schema";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  role: true,
  provider: true,
  isVerified: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Get All Users Service (paginated)
 */
export const GetAllUserService = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: safeUserSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get User By ID
 */
export const GetUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
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
export const AdminUpdateUserService = async (userId: string, data: AdminUpdateUserInput) => {
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

  const safeData: { role?: typeof data.role; accountStatus?: typeof data.accountStatus } = {};
  if (data.role !== undefined) safeData.role = data.role;
  if (data.accountStatus !== undefined) safeData.accountStatus = data.accountStatus;

  const updateUser = await prisma.user.update({
    where: { id: userId },
    data: safeData,
    select: safeUserSelect,
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
