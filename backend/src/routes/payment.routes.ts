import { Router } from "express";
import { protect } from "../middleware/protect.middleware";
import {
  initiatePayment,
  verifyPayment,
  getPaymentByBooking,
  paystackWebhook,
} from "../controllers/payment.controller";

const router: Router = Router();

/**
 * POST /api/payments/webhook
 * Paystack webhook — no auth, signature verified in handler
 */
router.post("/webhook", paystackWebhook);

// All routes below require authentication
router.use(protect);

/**
 * POST /api/payments/initiate/:bookingId
 * Initialize a Paystack payment for a booking
 */
router.post("/initiate/:bookingId", initiatePayment);

/**
 * GET /api/payments/verify/:reference
 * Verify a payment by Paystack reference (frontend callback)
 */
router.get("/verify/:reference", verifyPayment);

/**
 * GET /api/payments/booking/:bookingId
 * Get payment details for a booking
 */
router.get("/booking/:bookingId", getPaymentByBooking);

export default router;
