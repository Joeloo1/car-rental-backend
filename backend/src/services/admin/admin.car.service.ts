import { prisma } from "../../config/database";
import logger from "../../config/winston";
import AppError from "../../utils/AppError";
import { Prisma } from "../../generated/prisma/client";

/**
 * List all cars for admin (includes soft-deleted, unapproved, etc.)
 */
export const GetAllCarsAdminService = async (
  page = 1,
  limit = 20,
  approved?: boolean,
  deleted?: boolean,
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.CarWhereInput = {};

  if (approved !== undefined) where.isApproved = approved;

  // By default exclude soft-deleted; pass deleted=true to see them
  if (!deleted) where.deletedAt = null;

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: {
        lender: { select: { id: true, name: true, email: true } },
        images: { where: { isMain: true }, take: 1 },
        category: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.car.count({ where }),
  ]);

  return { cars, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

/**
 * Approve a car listing
 */
export const AdminApproveCarService = async (carId: string, adminId: string) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  logger.info("Admin approved car", { adminId, carId });

  return await prisma.car.update({
    where: { id: carId },
    data: { isApproved: true, approvedAt: new Date(), approvedBy: adminId },
  });
};

/**
 * Reject (un-approve) a car listing
 */
export const AdminRejectCarService = async (carId: string, adminId: string) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  logger.info("Admin rejected car", { adminId, carId });

  return await prisma.car.update({
    where: { id: carId },
    data: { isApproved: false, approvedAt: null, approvedBy: null },
  });
};

/**
 * Platform-wide analytics for the admin dashboard
 */
export const GetPlatformStatsService = async () => {
  const [
    totalUsers,
    totalLenders,
    totalCars,
    pendingApprovalCars,
    bookingCounts,
    revenueResult,
  ] = await Promise.all([
    prisma.user.count({ where: { accountStatus: "active" } }),
    prisma.user.count({ where: { role: "lender", accountStatus: "active" } }),
    prisma.car.count({ where: { deletedAt: null } }),
    prisma.car.count({ where: { isApproved: false, deletedAt: null } }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.booking.aggregate({ where: { status: "completed" }, _sum: { totalPrice: true } }),
  ]);

  const bookingsByStatus = Object.fromEntries(
    bookingCounts.map((b) => [b.status, b._count.id]),
  ) as Record<string, number>;

  return {
    users: { total: totalUsers, lenders: totalLenders },
    cars: { total: totalCars, pendingApproval: pendingApprovalCars },
    bookings: {
      total: Object.values(bookingsByStatus).reduce((a, b) => a + b, 0),
      pending: bookingsByStatus.pending ?? 0,
      confirmed: bookingsByStatus.confirmed ?? 0,
      completed: bookingsByStatus.completed ?? 0,
      cancelled: bookingsByStatus.cancelled ?? 0,
    },
    revenue: { total: revenueResult._sum.totalPrice ?? 0 },
  };
};

/**
 * Get all bookings for admin (platform-wide view)
 */
export const GetAllBookingsAdminService = async (
  page = 1,
  limit = 20,
  status?: string,
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.BookingWhereInput = status ? { status: status as any } : {};

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        car: { select: { id: true, title: true, brand: true, model: true } },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
