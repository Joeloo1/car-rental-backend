import Router from "express";
import { validateRequest } from "../middleware/validation_middleware";
import {
  CreateCarSchema,
  UpdateCarSchema,
  CarParamsSchema,
} from "../schema/car.schema";
import { restrictTo } from "../middleware/authorization";
import { protect } from "../middleware/protect.middleware";
import {
  createCar,
  getAllCars,
  getCarById,
  getCarByLender,
  updateCars,
  updateCarStatus,
  deleteCar,
} from "../controllers/car.controller";
import { Role } from "../types/role.types";
import carImageRouter from "./carImage.routes";

const router = Router();

/**
 * GET /api/cars
 * Get all cars with optional filtering and pagination
 * Query: { page?: number, limit?: number, brand?: string, status?: string, etc. }
 * Protection: PUBLIC
 */
router.route("/").get(getAllCars);

/**
 * GET /api/cars/:id
 * Get detailed information about a specific car by ID
 * Params: { id: string }
 * Validates request against CarParamsSchema
 * Protection: PUBLIC
 */
router.route("/:id").get(validateRequest(CarParamsSchema), getCarById);

/**
 * GET /api/cars/lender/:id
 * Get all cars owned/listed by a specific lender
 * Params: { id: string (lender ID) }
 * Protection: PUBLIC
 */
router.route("/lender/:id").get(getCarByLender);

// All routes below this middleware require authentication
router.use(protect);

/**
 * POST /api/cars
 * Create a new car listing
 * Body: { brand: string, model: string, year: number, price: number, images: string[], etc. }
 * Validates request against CreateCarSchema
 * Protection: PROTECTED (Lender only)
 */
router
  .route("/")
  .post(restrictTo(Role.LENDER), validateRequest(CreateCarSchema), createCar);

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
  .patch(restrictTo(Role.LENDER), validateRequest(UpdateCarSchema), updateCars);

/**
 * PATCH /api/cars/:id/status
 * Update car availability status (available, rented, maintenance, etc.)
 * Params: { id: string }
 * Body: { status: string }
 * Protection: PROTECTED (Lender only - must own the car)
 */
router.route("/:id/status").patch(restrictTo(Role.LENDER), updateCarStatus);

/**
 * DELETE /api/cars/:id
 * Delete a car listing permanently
 * Params: { id: string }
 * Protection: PROTECTED (Lender who owns the car OR Admin)
 */
router.route("/:id").delete(restrictTo(Role.LENDER, Role.Admin), deleteCar);

/**
 * MOUNT /api/cars/:carId/images
 * Mounts the carImage router under a specific car listing
 * All carImage routes will have access to :carId via mergeParams
 * Params: { carId: string (uuid) }
 * See: src/routes/carImage.routes.ts for all available image routes
 */
router.use("/:carId/images", carImageRouter);
export default router;
