import { Router } from "express";
import { protect } from "../middleware/protect.middleware";
import { restrictTo } from "../middleware/authorization";
import { UserRole } from "../generated/prisma/client";
import {
  getMyBookings,
  getLenderBookings,
  updateBookingStatus,
  getDashboardStats,
  createBooking,
  getBookingById,
} from "../controllers/booking.controller";
import { bookingLimiter } from "../middleware/ratelimit";

const router: Router = Router({ mergeParams: true });

// All booking routes requires authentication
router.use(protect);

/**
 * GET /api/bookings/me
 * Get all bookings for the currently authenticated user
 */
router.route("/me").get(getMyBookings);

/**
 * GET /api/bookings/lender
 * Get all bookings for cars owned by the authenticated lender
 */
router.route("/lender").get(restrictTo(UserRole.lender), getLenderBookings);

/**
 * GET /api/bookings/stats
 * Get dashboard statistics for the authenticated user
 */
router.route("/stats").get(getDashboardStats);

/**
 * GET /api/bookings/:id
 * Get a single booking by ID (renter, lender of that car, or admin)
 */
router.route("/:id").get(getBookingById);

/**
 * PATCH /api/bookings/:id/status
 * Update the status of a booking
 */
router.route("/:id/status").patch(updateBookingStatus);

/**
 * POST /api/cars/:carId/bookings
 * Create a new booking for a specific car
 * Note: this route should be mounted on carRoutes or we can leave it here
 * and mount bookingRoutes on `/api/cars/:carId/bookings` as well.
 */
router.post("/car/:carId", bookingLimiter, createBooking);

export default router;
