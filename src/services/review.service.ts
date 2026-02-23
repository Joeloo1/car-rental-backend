import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import { CreateReviewInput, UpdateReviewInput } from "../schema/review.schema";

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

  // prevent User from reviewing there own car
  if (userId === car.lenderId) {
    logger.warn(`User with ID: ${userId} cannot review their own car`);
    throw new AppError("You cannot review your own car", 400);
  }

  // Create Review
  const review = await prisma.review.create({
    data: {
      ...data,
      userId,
      carId,
      lenderId: car.lenderId,
    },
  });

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
    logger.warn(
      `User ${userId} attempted to update review ${reviewId} they don't own`,
    );
    throw new AppError("Unauthorized", 403);
  }

  // Update Review
  const updateReview = await prisma.review.update({
    where: { id: reviewId },
    data: { ...data },
  });

  return updateReview;
};

/**
 * Get All Reviews For A Car Service
 */
export const GetAllReviewForCarService = async (carId: string) => {
  // Check if car exist
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });
  if (!car) {
    logger.warn(`Car with ID: ${carId} not found`);
    throw new AppError("Car not found", 404);
  }

  const review = await prisma.review.findMany({
    where: { carId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return review;
};
/**
 * Get Review Service
 */
export const GetReviewService = async (reviewId: string) => {
  const review = await prisma.review.findMany({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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
 * Delete Review Service
 */
export const DeleteReviewService = async (userId: string, reviewId: string) => {
  // Check if review exist
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) {
    logger.warn(`Review with ID: ${reviewId} not found`);
    throw new AppError("Review not found", 404);
  }

  if (review.userId !== userId) {
    logger.warn(
      `User ${userId} attempted to delete review ${reviewId} they don't own`,
    );
    throw new AppError("Unauthorized", 403);
  }

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};
