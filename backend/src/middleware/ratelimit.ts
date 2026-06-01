import rateLimit from "express-rate-limit";

export const createLimiter = (max: number, windowMinutes: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "error", message },
  });

export const bookingLimiter = createLimiter(10, 60, "Too many booking attempts. Try again later.");
export const reviewLimiter = createLimiter(20, 60, "Too many review submissions.");
export const carCreateLimiter = createLimiter(30, 60, "Too many car listings created.");
