import { Router } from "express";
import { validateRequest } from "../middleware/validation_middleware";
import { CreateCarSchema, UpdateCarSchema, CarParamsSchema } from "../schema/car.schema";
import { restrictTo } from "../middleware/authorization";
import { protect } from "../middleware/protect.middleware";
import { carCreateLimiter, reviewLimiter } from "../middleware/ratelimit";
import {
  createCar,
  getAllCars,
  getCarById,
  getCarByLender,
  updateCars,
  updateCarStatus,
  deleteCar,
  checkCarAvailability,
  searchCars,
} from "../controllers/car.controller";
import { UserRole } from "../generated/prisma/client";
import carImageRouter from "./carImage.routes";
import { createReviewSchema } from "../schema/review.schema";
import { createReview, getAllReviewForCar } from "../controllers/review.controller";

const router: Router = Router();

/**
 * GET /api/cars
 * Get all cars with optional filtering and pagination
 * Query: { page?: number, limit?: number, brand?: string, status?: string, etc. }
 * Protection: PUBLIC
 * Cache: DISABLED (Redis connection issue)
 */
router.route("/").get(getAllCars);

/**
 * GET /api/cars/search?q=toyota
 * Autocomplete — returns matching brands, models, and cities (must be before /:id)
 * Protection: PUBLIC
 */
router.route("/search").get(searchCars);

/**
 * GET /api/cars/:id
 * Get detailed information about a specific car by ID
 * Params: { id: string }
 * Validates request against CarParamsSchema
 * Protection: PUBLIC
 * Cache: DISABLED (Redis connection issue)
 */
router.route("/:id").get(validateRequest(CarParamsSchema), getCarById);

/**
 * GET /api/cars/lender/:id
 * Get all cars owned/listed by a specific lender
 * Params: { id: string (lender ID) }
 * Protection: PUBLIC
 * Cache: DISABLED (Redis connection issue)
 */
router.route("/lender/:id").get(getCarByLender);

/**
 * GET /api/cars/:id/reviews
 * Get all reviews for a specific car
 * Params: { id: string (car ID) }
 * Protection: PUBLIC
 */
router.route("/:id/reviews").get(getAllReviewForCar);

/**
 * GET /api/cars/:id/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Check if a car is available for a given date range
 * Protection: PUBLIC
 */
router.route("/:id/availability").get(checkCarAvailability);

// All routes below this middleware require authentication
router.use(protect);

/**
 * POST /api/cars
 * Create a new car listing
 * Body: { brand: string, model: string, year: number, price: number, images: string[], etc. }
 * Validates request against CreateCarSchema
 * Protection: PROTECTED (Lender only)
 */
router.route("/").post(restrictTo(UserRole.lender), carCreateLimiter, validateRequest(CreateCarSchema), createCar);

/**
 * PATCH /api/cars/:id
 * Update car details (price, description, features, etc.)
 * Params: { id: string }
 * Body: { brand?: string, model?: string, price?: number, etc. }
 * Validates request against UpdateCarSchema
 * Protection: PROTECTED (Lender only - must own the car)
 */
router
  .route("/:id")
  .patch(restrictTo(UserRole.lender), validateRequest(UpdateCarSchema), updateCars);

/**
 * PATCH /api/cars/:id/status
 * Update car availability status (available, rented, maintenance, etc.)
 * Params: { id: string }
 * Body: { status: string }
 * Protection: PROTECTED (Lender only - must own the car)
 */
router.route("/:id/status").patch(restrictTo(UserRole.lender), updateCarStatus);

/**
 * DELETE /api/cars/:id
 * Delete a car listing permanently
 * Params: { id: string }
 * Protection: PROTECTED (Lender who owns the car OR Admin)
 */
router.route("/:id").delete(restrictTo(UserRole.lender, UserRole.admin), deleteCar);

/**
 * POST /api/cars/:id/reviews
 * Create a review for a specific car
 * Params: { id: string (car ID) }
 * Body: { rating: number, comment?: string }
 * Protection: PROTECTED (Renter only - cannot review your own car)
 */
router.route("/:id/reviews").post(reviewLimiter, validateRequest(createReviewSchema), createReview);

/**
 * MOUNT /api/cars/:carId/images
 * Mounts the carImage router under a specific car listing
 * All carImage routes will have access to :carId via mergeParams
 * Params: { carId: string (uuid) }
 * See: src/routes/carImage.routes.ts for all available image routes
 */
router.use("/:carId/images", carImageRouter);

export default router;
