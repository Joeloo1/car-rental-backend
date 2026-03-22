import { Router, Request, Response } from "express";

import categoryRoutes from "../routes/category.routes";
import authRoutes from "../routes/auth/auth.routes";
import userRoutes from "../routes/user/user.route";
import addressRoutes from "../routes/address.routes";
import carRoutes from "../routes/car.routes";
import adminUserRoutes from "../routes/admin/admin.user.routes";
import reviewRoutes from "../routes/review.routes";
import chatRoutes from "../routes/chat.routes";

const router = Router();

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

export default router;
