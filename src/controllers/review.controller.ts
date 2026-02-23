import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import logger from "../config/winston";
import {
  CreateReviewService,
  GetReviewService,
  UpdateReviewService,
  DeleteReviewService,
  GetAllReviewForCarService,
} from "../services/review.service";

// Create Review
export const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await CreateReviewService(
      req.user.id,
      req.params.id as string,
      req.body,
    );

    logger.info(`User with ID: ${req.user.id} creating a review`);
    res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
    logger.info(`Review Created Successfully`);
  },
);

// Update Review
export const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const review = await UpdateReviewService(
      req.user.id,
      req.params.id as string,
      req.body,
    );

    logger.info(`Review with ID: ${review.id} is been Updated`);
    res.status(200).json({
      status: "success",
      data: { review },
    });

    logger.info("Review updated successfully", review.id);
  },
);

// Get All Reviews for a Car
export const getAllReviewForCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await GetAllReviewForCarService(req.params.id as string);

    logger.info(`Fetching all reviews for car with ID: ${req.params.id}`);
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
    logger.info(
      `Fetched all reviews for car with ID: ${req.params.id} successfully`,
    );
  },
);

// Get Review
export const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviewID = req.params.id as string;
    const review = await GetReviewService(reviewID);

    logger.info(`Fetching Review ${reviewID} from database`);
    res.status(200).json({
      status: "success",
      data: { review },
    });
    logger.info("Fetched Review Successfully");
  },
);

// Delete Review
export const deleteReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await DeleteReviewService(req.user.id, req.params.id as string);

    res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
    });
    logger.info(`Review Deleted successfully`);
  },
);
