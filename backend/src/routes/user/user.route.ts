import { Router } from "express";
import { uploadProfileImage } from "../../middleware/upload.middleware";
import { resizePhoto } from "../../middleware/resize-middleware";
import {
  updateUser,
  deleteUser,
  getUser,
} from "../../controllers/user/user.controller";
import { protect } from "../../middleware/protect.middleware";

const router = Router();

router.use(protect);

router.patch(
  "/updateMe",
  uploadProfileImage.single("profileImage"),
  resizePhoto,
  updateUser,
);

router.get("/me", getUser);
router.delete("/deleteMe", deleteUser);

// Notifications
import { getMyNotifications, markRead, markAllRead } from "../../controllers/notification.controller";
router.get("/notifications", getMyNotifications);
router.patch("/notifications/read-all", markAllRead);
router.patch("/notifications/:id/read", markRead);

export default router;

