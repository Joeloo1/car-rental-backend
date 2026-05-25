import { prisma } from "../config/database";
import { getCache, setCache, deleteCache } from "../config/redis";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import config from "../config/config.env";
import { CreateBookingInput } from "../schema/booking.schema";
import { Prisma, BookingStatus } from "../generated/prisma/client";
import { CreateNotification } from "./notification.service";
import { sendEmail, getBookingEmailHtml } from "../utils/email";

// ─── Cache TTLs ───────────────────────────────────────────────────────────────
const TTL_BOOKINGS = 2 * 60; // 2 minutes — bookings change frequently
const TTL_STATS = 2 * 60; // 2 minutes

/**
 * Create a new booking (Reserve a car)
 */
export const CreateBookingService = async (
  carId: string,
  data: CreateBookingInput,
  userId: string,
) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate >= endDate) {
    throw new AppError("End date must be after start date", 400);
  }

  // All availability checks and the booking creation run inside a serializable
  // transaction so concurrent requests cannot double-book the same dates.
  const booking = await prisma.$transaction(
    async (tx) => {
      const car = await tx.car.findUnique({ where: { id: carId } });

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

      const overlappingBooking = await tx.booking.findFirst({
        where: {
          carId,
          status: { in: ["pending", "confirmed"] },
          OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
        },
      });

      if (overlappingBooking) {
        throw new AppError("Car is already booked for these dates", 400);
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const totalPrice = car.pricePerDay * diffDays + config.SERVICE_FEE;

      const newBooking = await tx.booking.create({
        data: { userId, carId, startDate, endDate, totalPrice, status: "pending" },
        include: { car: true },
      });

      await tx.car.update({
        where: { id: carId },
        data: { availabilityStatus: "rented" },
      });

      return newBooking;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  const { car } = booking;

  // Invalidate caches: renter's bookings, lender's bookings, stats, and car caches
  await Promise.all([
    deleteCache(`bookings:user:${userId}`),
    deleteCache(`bookings:lender:${car.lenderId}`),
    deleteCache(`stats:${userId}:User`),
    deleteCache(`stats:${car.lenderId}:lender`),
    deleteCache(`cars:id:${carId}`),
  ]);

  await CreateNotification(
    car.lenderId,
    "New Booking Request",
    `A user has requested to book your ${car.title}.`,
    "booking",
    "/dashboard",
  );

  await CreateNotification(
    userId,
    "Booking Pending",
    `Your request for ${car.title} is pending approval.`,
    "info",
    "/dashboard",
  );

  // Send confirmation emails to both parties (fire-and-forget — don't block response)
  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  const dashboardUrl = config.CLIENT_URL || "http://localhost:5173";

  try {
    const [renter, lender] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      prisma.user.findUnique({ where: { id: car.lenderId }, select: { email: true, name: true } }),
    ]);

    const emailData = {
      carLabel: car.title,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
      totalPrice: booking.totalPrice,
      status: "pending",
      dashboardUrl,
    };

    await Promise.all([
      renter?.email
        ? sendEmail({
            email: renter.email,
            subject: `Booking Request Received — ${car.title} · LuxeDrive`,
            html: getBookingEmailHtml(
              renter.name,
              emailData.carLabel,
              emailData.startDate,
              emailData.endDate,
              emailData.totalPrice,
              emailData.status,
              dashboardUrl,
            ),
          })
        : Promise.resolve(),
      lender?.email
        ? sendEmail({
            email: lender.email,
            subject: `New Booking Request — ${car.title} · LuxeDrive`,
            html: getBookingEmailHtml(
              lender.name,
              emailData.carLabel,
              emailData.startDate,
              emailData.endDate,
              emailData.totalPrice,
              emailData.status,
              `${dashboardUrl}/lender`,
            ),
          })
        : Promise.resolve(),
    ]);
  } catch (emailErr) {
    logger.error("Failed to send booking creation emails", emailErr);
  }

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

  // Renters can only cancel — not confirm or complete
  if (userRole === "User" && status !== "cancelled") {
    throw new AppError("Renters can only cancel a booking", 403);
  }

  // State machine: enforce valid transitions
  const VALID_TRANSITIONS: Record<string, BookingStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };
  const allowed = VALID_TRANSITIONS[booking.status as string] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Cannot transition booking from "${booking.status}" to "${status}"`,
      400,
    );
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

  const isLenderAction = userRole === "lender";
  const notifType =
    status === "confirmed" ? "success" : status === "cancelled" ? "warning" : "info";

  if (isLenderAction) {
    // Lender acted — notify the renter
    await CreateNotification(
      booking.userId,
      "Booking Status Updated",
      `Your booking for ${booking.car.title} has been ${status}.`,
      notifType,
      "/dashboard",
    );
  } else {
    // Renter acted — notify the lender
    await CreateNotification(
      booking.car.lenderId,
      "Booking Cancelled",
      `A renter has cancelled their booking for ${booking.car.title}.`,
      "warning",
      "/lender",
    );
  }

  // Email both parties on confirmed or cancelled
  if (status === "confirmed" || status === "cancelled") {
    try {
      const formatDate = (d: Date) => d.toISOString().split("T")[0];
      const dashboardUrl = config.CLIENT_URL || "http://localhost:5173";

      const [renter, lender] = await Promise.all([
        prisma.user.findUnique({
          where: { id: booking.userId },
          select: { email: true, name: true },
        }),
        prisma.user.findUnique({
          where: { id: booking.car.lenderId },
          select: { email: true, name: true },
        }),
      ]);

      const emailData = {
        carLabel: booking.car.title,
        startDate: formatDate(booking.startDate),
        endDate: formatDate(booking.endDate),
        totalPrice: booking.totalPrice,
        status,
      };

      await Promise.all([
        renter?.email
          ? sendEmail({
              email: renter.email,
              subject: `Booking ${status === "confirmed" ? "Confirmed" : "Cancelled"} — ${booking.car.title} · LuxeDrive`,
              html: getBookingEmailHtml(
                renter.name,
                emailData.carLabel,
                emailData.startDate,
                emailData.endDate,
                emailData.totalPrice,
                emailData.status,
                dashboardUrl,
              ),
            })
          : Promise.resolve(),
        lender?.email
          ? sendEmail({
              email: lender.email,
              subject: `Booking ${status === "confirmed" ? "Confirmed" : "Cancelled"} — ${booking.car.title} · LuxeDrive`,
              html: getBookingEmailHtml(
                lender.name,
                emailData.carLabel,
                emailData.startDate,
                emailData.endDate,
                emailData.totalPrice,
                emailData.status,
                `${dashboardUrl}/lender`,
              ),
            })
          : Promise.resolve(),
      ]);
    } catch (emailErr) {
      logger.error("Failed to send booking status update emails", emailErr);
    }
  }

  logger.info(`Booking ${bookingId} status updated to ${status}`);
};

/**
 * Get Dashboard Statistics
 */
export const GetDashboardStatsService = async (userId: string, userRole: string) => {
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
