import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import config from "../config/config.env";
import { deleteCacheByPattern } from "../config/redis";
import { CreateNotification } from "./notification.service";

const PAYSTACK_BASE = "https://api.paystack.co";

const paystackHeaders = () => ({
  Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

/**
 * Initiate a Paystack payment for a booking.
 * Returns the Paystack authorization URL for the frontend to redirect to.
 */
export const InitiatePaymentService = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { email: true, name: true } },
      car: { select: { title: true } },
      payment: true,
    },
  });

  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId !== userId) throw new AppError("Unauthorized", 403);
  if (booking.status !== "pending") {
    throw new AppError("Payment can only be initiated for pending bookings", 400);
  }
  if (booking.payment?.status === "successful") {
    throw new AppError("This booking has already been paid for", 400);
  }

  // Amount in kobo (Paystack uses smallest currency unit)
  const amountInKobo = Math.round(booking.totalPrice * 100);

  // Use existing reference if payment already initiated (idempotent retry)
  let reference = booking.payment?.reference;
  if (!reference) {
    reference = `LUXE-${bookingId}-${Date.now()}`;
    await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount: booking.totalPrice,
        reference,
        status: "pending",
      },
    });
  }

  const callbackUrl = `${config.CLIENT_URL}/bookings/${bookingId}/payment/verify`;

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      email: booking.user.email,
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        bookingId,
        userId,
        carTitle: booking.car.title,
      },
    }),
  });

  const result = (await response.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };

  if (!result.status || !result.data) {
    logger.error("Paystack initialization failed", { result, bookingId });
    throw new AppError("Payment initialization failed. Please try again.", 502);
  }

  logger.info(`Payment initiated for booking ${bookingId}`, { reference });

  return {
    authorizationUrl: result.data.authorization_url,
    accessCode: result.data.access_code,
    reference: result.data.reference,
  };
};

/**
 * Verify a Paystack payment by reference (called from webhook or frontend callback).
 */
export const VerifyPaymentService = async (reference: string) => {
  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: paystackHeaders(),
  });

  const result = (await response.json()) as {
    status: boolean;
    data?: {
      status: string;
      amount: number;
      reference: string;
      metadata?: { bookingId?: string; userId?: string };
    };
  };

  if (!result.status || !result.data) {
    throw new AppError("Payment verification failed", 502);
  }

  const paystackStatus = result.data.status; // "success" | "failed" | "abandoned" etc.
  const isSuccess = paystackStatus === "success";

  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) throw new AppError("Payment record not found", 404);

  // Idempotency — don't re-process an already successful payment
  if (payment.status === "successful") {
    return await prisma.booking.findUnique({ where: { id: payment.bookingId } });
  }

  await prisma.payment.update({
    where: { reference },
    data: {
      status: isSuccess ? "successful" : "failed",
      paidAt: isSuccess ? new Date() : null,
      metadata: result.data as any,
    },
  });

  if (!isSuccess) {
    logger.warn(`Payment failed for reference ${reference}`, { paystackStatus });
    return null;
  }

  // Confirm the booking and free the car if it was auto-rented
  const updatedBooking = await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "confirmed" },
    include: { car: true },
  });

  // Cache busting
  await Promise.all([
    deleteCacheByPattern(`bookings:user:${payment.userId}:*`),
    deleteCacheByPattern(`bookings:lender:${updatedBooking.car.lenderId}:*`),
  ]);

  await CreateNotification(
    payment.userId,
    "Payment Confirmed",
    `Your payment for ${updatedBooking.car.title} was successful. Booking confirmed!`,
    "success",
    `/bookings/${payment.bookingId}`,
  );

  await CreateNotification(
    updatedBooking.car.lenderId,
    "Booking Paid",
    `A renter has paid for ${updatedBooking.car.title}. Booking is confirmed.`,
    "success",
    "/lender",
  );

  logger.info(`Payment verified and booking confirmed: ${payment.bookingId}`);
  return updatedBooking;
};

/**
 * Get payment details for a booking
 */
export const GetPaymentByBookingService = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: { select: { userId: true, car: { select: { lenderId: true } } } } },
  });

  if (!payment) throw new AppError("No payment found for this booking", 404);

  const isRenter = payment.booking.userId === userId;
  const isLender = payment.booking.car.lenderId === userId;

  if (!isAdmin && !isRenter && !isLender) throw new AppError("Unauthorized", 403);

  return payment;
};
