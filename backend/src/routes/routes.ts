import { Router, Request, Response } from "express";
import express from "express";

import categoryRoutes from "./category.routes";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.route";
import addressRoutes from "./address.routes";
import carRoutes from "./car.routes";
import adminUserRoutes from "./admin/admin.user.routes";
import adminCarRoutes from "./admin/admin.car.routes";
import reviewRoutes from "./review.routes";
import chatRoutes from "./chat.routes";
import bookingRoutes from "./booking.routes";
import paymentRoutes from "./payment.routes";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: true,
    message: "Server is Healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Capture raw body for Paystack webhook signature verification
router.use(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  (req: Request, _res: Response, next) => {
    (req as any).rawBody = req.body;
    req.body = JSON.parse(req.body.toString());
    next();
  },
);

router.use("/admin/users", adminUserRoutes);
router.use("/admin", adminCarRoutes);
router.use("/category", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/address", addressRoutes);
router.use("/cars", carRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chats", chatRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

export default router;
