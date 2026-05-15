import Router from "express";
import { validateRequest } from "../middleware/validation_middleware";
import {
  createReviewSchema,
  reviewParamsSchema,
  updateReviewSchema,
} from "../schema/review.schema";
import { protect } from "../middleware/protect.middleware";
import {
  getReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";

const router = Router();

/**
 * GET /api/reviews/:id
 * Get a single review by ID
 * Params: { id: string (review ID) }
 * Protection: PUBLIC
 */
router.route("/:id").get(validateRequest(reviewParamsSchema), getReview);

// All routes below this middleware require authentication
router.use(protect);

/**
 * PATCH /api/reviews/:id
 * Update a review by ID
 * Params: { id: string (review ID) }
 * Body: { rating?: number, comment?: string }
 * Protection: PROTECTED (Renter only - must own the review)
 */
router.route("/:id").patch(validateRequest(updateReviewSchema), updateReview);

/**
 * DELETE /api/reviews/:id
 * Delete a review by ID
 * Params: { id: string (review ID) }
 * Protection: PROTECTED (Renter who owns the review OR Admin)
 */
router.route("/:id").delete(deleteReview);

export default router;
