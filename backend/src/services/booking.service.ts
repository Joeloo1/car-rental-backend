import { prisma } from "../config/database";
import { getCache, setCache, deleteCache } from "../config/redis";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import { CreateBookingInput } from "../schema/booking.schema";
import { BookingStatus, CarStatus } from "../generated/prisma/client";
import { CreateNotification } from "./notification.service";

// ─── Cache TTLs ───────────────────────────────────────────────────────────────
const TTL_BOOKINGS = 2 * 60;  // 2 minutes — bookings change frequently
const TTL_STATS = 2 * 60;     // 2 minutes


/**
 * Create a new booking (Reserve a car)
 */
export const CreateBookingService = async (
  carId: string,
  data: CreateBookingInput,
  userId: string,
) => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    logger.warn(`Car with ID: ${carId} not found`);
    throw new AppError("Car not found", 404);
  }

  if (car.availabilityStatus !== "available") {
    logger.warn(`Car with ID: ${carId} is not available`);
    throw new AppError("Car is not currently available for rent", 400);
  }

  if (car.lenderId === userId) {
    logger.warn(`User ${userId} attempted to book their own car ${carId}`);
    throw new AppError("You cannot book your own car", 400);
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate >= endDate) {
    throw new AppError("End date must be after start date", 400);
  }

  // Check for overlapping bookings
  const overlappingBookings = await prisma.booking.findFirst({
    where: {
      carId,
      status: { in: ["pending", "confirmed"] },
      OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
    },
  });

  if (overlappingBookings) {
    throw new AppError("Car is already booked for these dates", 400);
  }

  // Calculate total price
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = car.pricePerDay * diffDays + 65; // Fixed $65 service fee

  // Create booking and update car status transaction
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        userId,
        carId,
        startDate,
        endDate,
        totalPrice,
        status: "pending",
      },
      include: {
        car: true,
      },
    });

    // We can mark car as rented right away or later. Let's mark as rented for pending.
    await tx.car.update({
      where: { id: carId },
      data: { availabilityStatus: "rented" },
    });

    return newBooking;
  });

  // Invalidate caches: renter's bookings, lender's bookings, stats, and car caches
  await Promise.all([
    deleteCache(`bookings:user:${userId}`),
    deleteCache(`bookings:lender:${car.lenderId}`),
    deleteCache(`stats:${userId}:User`),
    deleteCache(`stats:${car.lenderId}:lender`),
    deleteCache(`cars:id:${carId}`),
  ]);

  // 3. Send Notifications
  await CreateNotification(
    car.lenderId,
    "New Booking Request",
    `A user has requested to book your ${car.title}.`,
    "booking",
    "/dashboard"
  );

  await CreateNotification(
    userId,
    "Booking Pending",
    `Your request for ${car.title} is pending approval.`,
    "info",
    "/dashboard"
  );

  logger.info(`Booking created: ${booking.id}`);
  return booking;
};


/**
 * Get all bookings for a user (renter)
 */
export const GetUserBookingsService = async (userId: string) => {
  const cacheKey = `bookings:user:${userId}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any[]>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      car: {
        include: {
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, bookings, TTL_BOOKINGS);

  return bookings;
};

/**
 * Get all bookings for cars owned by a lender
 */
export const GetLenderBookingsService = async (lenderId: string) => {
  const cacheKey = `bookings:lender:${lenderId}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any[]>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      car: {
        lenderId,
      },
    },
    include: {
      car: {
        include: {
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, bookings, TTL_BOOKINGS);

  return bookings;
};

/**
 * Update Booking Status
 */
export const UpdateBookingStatusService = async (
  bookingId: string,
  status: BookingStatus,
  userId: string,
  userRole: string,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Authorization check
  if (userRole === "lender" && booking.car.lenderId !== userId) {
    throw new AppError("You can only manage bookings for your own cars", 403);
  }

  if (userRole === "User" && booking.userId !== userId) {
    throw new AppError("You can only update your own bookings", 403);
  }

  // If cancelling or completing, make the car available again
  if (status === "cancelled" || status === "completed") {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status },
      }),
      prisma.car.update({
        where: { id: booking.carId },
        data: { availabilityStatus: "available" },
      }),
    ]);
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  // Invalidate caches for both parties
  await Promise.all([
    deleteCache(`bookings:user:${booking.userId}`),
    deleteCache(`bookings:lender:${booking.car.lenderId}`),
    deleteCache(`stats:${booking.userId}:User`),
    deleteCache(`stats:${booking.car.lenderId}:lender`),
    deleteCache(`cars:id:${booking.carId}`),
  ]);

  // Send Notification to Renter
  await CreateNotification(
    booking.userId,
    "Booking Status Updated",
    `Your booking for ${booking.car.title} has been ${status}.`,
    status === "confirmed" ? "success" : status === "cancelled" ? "warning" : "info",
    "/dashboard"
  );

  logger.info(`Booking ${bookingId} status updated to ${status}`);
};


/**
 * Get Dashboard Statistics
 */
export const GetDashboardStatsService = async (
  userId: string,
  userRole: string,
) => {
  const cacheKey = `stats:${userId}:${userRole}`;

  // ── Cache read ──────────────────────────────────────────────────────────────
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  let result: any;

  if (userRole === "lender") {
    const statsQuery = await prisma.booking.aggregate({
      where: {
        car: { lenderId: userId },
        status: "completed",
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    });

    const activeRentalsCount = await prisma.booking.count({
      where: {
        car: { lenderId: userId },
        status: { in: ["pending", "confirmed"] },
      },
    });

    const verifiedCarsCount = await prisma.car.count({
      where: { lenderId: userId },
    });

    result = {
      totalTrips: statsQuery._count.id || 0,
      totalEarnings: statsQuery._sum.totalPrice || 0,
      activeRentals: activeRentalsCount,
      verifiedCars: verifiedCarsCount,
    };
  } else {
    // Regular user stats
    const totalTrips = await prisma.booking.count({
      where: { userId, status: "completed" },
    });

    const activeRentals = await prisma.booking.count({
      where: { userId, status: { in: ["pending", "confirmed"] } },
    });

    result = {
      totalTrips,
      totalEarnings: 0,
      activeRentals,
      verifiedCars: 0,
    };
  }

  // ── Cache write ─────────────────────────────────────────────────────────────
  await setCache(cacheKey, result, TTL_STATS);

  return result;
};
