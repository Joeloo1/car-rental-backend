import { Request, Response } from "express";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync";
import { AuthRequest } from "../types/authRequest";
import {
  InitiatePaymentService,
  VerifyPaymentService,
  GetPaymentByBookingService,
} from "../services/payment.service";
import logger from "../config/winston";
import config from "../config/config.env";

export const initiatePayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const bookingId = req.params.bookingId as string;
  const result = await InitiatePaymentService(bookingId, req.user!.id);
  res.status(200).json({ status: "success", data: result });
});

export const verifyPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const reference = req.params.reference as string;
  const booking = await VerifyPaymentService(reference);
  res.status(200).json({
    status: "success",
    message: "Payment verified",
    data: { booking },
  });
});

export const getPaymentByBooking = catchAsync(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === "admin";
  const payment = await GetPaymentByBookingService(req.params.bookingId as string, req.user!.id, isAdmin);
  res.status(200).json({ status: "success", data: { payment } });
});

/**
 * Paystack webhook — no auth middleware, signature verified manually.
 * Must be registered with express.raw() so we get the raw body for HMAC.
 */
export const paystackWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers["x-paystack-signature"] as string | undefined;

  if (!signature || !config.PAYSTACK_SECRET_KEY) {
    res.status(400).json({ message: "Missing signature" });
    return;
  }

  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!rawBody) {
    res.status(400).json({ message: "Raw body not available" });
    return;
  }

  const expectedSig = crypto
    .createHmac("sha512", config.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    logger.warn("Paystack webhook signature mismatch");
    res.status(401).json({ message: "Invalid signature" });
    return;
  }

  const event = req.body as { event: string; data: { reference: string } };

  // Always acknowledge immediately — Paystack retries on non-2xx
  res.status(200).json({ received: true });

  if (event.event === "charge.success") {
    try {
      await VerifyPaymentService(event.data.reference);
    } catch (err) {
      logger.error("Webhook payment verification failed", { reference: event.data.reference, err });
    }
  }
};
