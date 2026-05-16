import { Router, Request, Response } from "express";

import categoryRoutes from "./category.routes";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.route";
import addressRoutes from "./address.routes";
import carRoutes from "./car.routes";
import adminUserRoutes from "./admin/admin.user.routes";
import reviewRoutes from "./review.routes";
import chatRoutes from "./chat.routes";
import bookingRoutes from "./booking.routes";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: true,
    message: "Server is Healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/admin/users", adminUserRoutes);
router.use("/category", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/address", addressRoutes);
router.use("/cars", carRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chats", chatRoutes);
router.use("/bookings", bookingRoutes);

export default router;
