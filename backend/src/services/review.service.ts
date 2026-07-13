import { prisma } from "../config/database";
import { Prisma } from "../generated/prisma/client";
import { getCache, setCache, deleteCache, deleteCacheByPattern } from "../config/redis";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import { CreateReviewInput, UpdateReviewInput } from "../schema/review.schema";

async function syncCarAverageRating(carId: string) {
  const result = await prisma.review.aggregate({
    where: { carId },
    _avg: { rating: true },
    _count: { id: true },
  });
  const avg = result._avg.rating ?? 0;
  await prisma.car.update({
    where: { id: carId },
    data: { averageRating: Number(avg.toFixed(1)) },
  });
}

// ─── Cache TTL ────────────────────────────────────────────────────────────────
const TTL_REVIEWS = 5 * 60; // 5 minutes

/**
 * Create Review Schema
 */
export const CreateReviewService = async (
  userId: string,
  carId: string,
  data: CreateReviewInput,
) => {
  // Check if car exist
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });
  if (!car) {
    logger.warn(`Car with ID: ${carId} not found`);
    throw new AppError("Car not found", 404);
  }

  // prevent User from reviewing their own car
  if (userId === car.lenderId) {
    logger.warn(`User with ID: ${userId} cannot review their own car`);
    throw new AppError("You cannot review your own car", 400);
  }

  if (!car.lenderId) {
    throw new AppError("Car has no associated lender", 500);
  }

  // Only allow reviews after a completed booking
  const completedBooking = await prisma.booking.findFirst({
    where: { carId, userId, status: "completed" },
  });
  if (!completedBooking) {
    throw new AppError("You can only review a car after completing a booking", 403);
  }

  // Create Review
  let review;
  try {
    review = await prisma.review.create({
      data: { ...data, userId, carId, lenderId: car.lenderId },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new AppError("You have already reviewed this car", 409);
    }
    throw err;
  }

  await syncCarAverageRating(carId);

  // Invalidate reviews cache for this car + the car's detail page (which shows reviews)
  await Promise.all([deleteCacheByPattern(`reviews:car:${carId}:*`), deleteCache(`cars:id:${carId}`)]);


  return review;
};

/**
 * Update Review Service
 */
export const UpdateReviewService = async (
  userId: string,
  reviewId: string,
  data: UpdateReviewInput,
) => {
  // Check if review exist
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    logger.warn(`Review with ID: ${reviewId} not found`);
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== userId) {
    logger.warn(`User ${userId} attempted to update review ${reviewId} they don't own`);
    throw new AppError("Unauthorized", 403);
  }

  // Update Review
  const updateReview = await prisma.review.update({
    where: { id: reviewId },
    data: { ...data },
  });

  await syncCarAverageRating(review.carId);

  // Invalidate caches
  await Promise.all([
    deleteCacheByPattern(`reviews:car:${review.carId}:*`),
    deleteCache(`cars:id:${review.carId}`),
  ]);

  return updateReview;
};

/**
 * Get All Reviews For A Car Service (paginated)
 */
export const GetAllReviewForCarService = async (
  carId: string,
  page = 1,
  limit = 10,
  sortBy: "createdAt" | "rating" = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
) => {
  const cacheKey = `reviews:car:${carId}:${page}:${limit}:${sortBy}:${sortOrder}`;

  const cached = await getCache<any>(cacheKey);
  if (cached) {
    logger.info(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { carId },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count({ where: { carId } }),
  ]);

  const result = { reviews, total, page, totalPages: Math.ceil(total / limit) };
  await setCache(cacheKey, result, TTL_REVIEWS);

  return result;
};

/**
 * Get Review Service
 */
export const GetReviewService = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      car: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!review) {
    logger.warn(`Review with ID: ${reviewId} not found`);
    throw new AppError("Review not found", 404);
  }

  return review;
};

/**
 * Get all reviews written by a user
 */
export const GetMyReviewsService = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        car: {
          select: {
            id: true,
            title: true,
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { userId } }),
  ]);
  return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Delete Review Service
 */
export const DeleteReviewService = async (userId: string, reviewId: string, isAdmin = false) => {
  // Check if review exist
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    logger.warn(`Review with ID: ${reviewId} not found`);
    throw new AppError("Review not found", 404);
  }

  if (!isAdmin && review.userId !== userId) {
    logger.warn(`User ${userId} attempted to delete review ${reviewId} they don't own`);
    throw new AppError("Unauthorized", 403);
  }

  const result = await prisma.review.delete({
    where: { id: reviewId },
  });

  await syncCarAverageRating(review.carId);

  // Invalidate caches
  await Promise.all([
    deleteCacheByPattern(`reviews:car:${review.carId}:*`),
    deleteCache(`cars:id:${review.carId}`),
  ]);

  return result;
};
