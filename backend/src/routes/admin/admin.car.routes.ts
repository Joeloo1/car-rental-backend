import { Router } from "express";
import { protect } from "../../middleware/protect.middleware";
import { restrictTo } from "../../middleware/authorization";
import { UserRole } from "../../generated/prisma/client";
import {
  getAllCarsAdmin,
  approveCar,
  rejectCar,
  getPlatformStats,
  getAllBookingsAdmin,
} from "../../controllers/admin/admin.car.controller";

const router: Router = Router();

router.use(protect);
router.use(restrictTo(UserRole.admin));

/**
 * GET /api/admin/stats
 * Platform-wide analytics
 */
router.get("/stats", getPlatformStats);

/**
 * GET /api/admin/cars
 * List all cars — supports ?approved=false for unapproved, ?deleted=true for soft-deleted
 */
router.get("/cars", getAllCarsAdmin);

/**
 * PATCH /api/admin/cars/:id/approve
 * Approve a car listing
 */
router.patch("/cars/:id/approve", approveCar);

/**
 * PATCH /api/admin/cars/:id/reject
 * Reject (un-approve) a car listing
 */
router.patch("/cars/:id/reject", rejectCar);

/**
 * GET /api/admin/bookings
 * Platform-wide booking list — supports ?status=pending|confirmed|completed|cancelled
 */
router.get("/bookings", getAllBookingsAdmin);

export default router;
