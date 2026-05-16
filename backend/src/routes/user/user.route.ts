import { Router } from "express";
import { uploadProfileImage } from "../../middleware/upload.middleware";
import { resizePhoto } from "../../middleware/resize-middleware";
import {
  updateUser,
  deleteUser,
  getUser,
} from "../../controllers/user/user.controller";
import { protect } from "../../middleware/protect.middleware";
import {
  getMyNotifications,
  markRead,
  markAllRead,
} from "../../controllers/notification.controller";

const router: Router = Router();

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
router.get("/notifications", getMyNotifications);
router.patch("/notifications/:id/read", markRead);
router.patch("/notifications/mark-all-read", markAllRead);

export default router;
