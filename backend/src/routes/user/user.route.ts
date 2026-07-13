import { Router } from "express";
import { uploadProfileImage } from "../../middleware/upload.middleware";
import { resizePhoto } from "../../middleware/resize-middleware";
import {
  updateUser,
  deleteUser,
  getUser,
  upgradeToLender,
  changePassword,
  getMyReviews,
  getPublicLenderProfile,
} from "../../controllers/user/user.controller";
import { protect } from "../../middleware/protect.middleware";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
} from "../../controllers/notification.controller";
import { getFavorites, addFavorite, removeFavorite } from "../../controllers/favorite.controller";

const router: Router = Router();

// Public endpoint — no auth required
router.get("/lender/:id", getPublicLenderProfile);

router.use(protect);

router.patch("/updateMe", uploadProfileImage.single("profileImage"), resizePhoto, updateUser);

router.get("/me", getUser);
router.delete("/deleteMe", deleteUser);
router.post("/upgrade-to-lender", upgradeToLender);
router.post("/change-password", changePassword);
router.get("/me/reviews", getMyReviews);

// Notifications — specific paths before parameterised ones
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/mark-all-read", markAllRead);
router.delete("/notifications", deleteAllNotifications);
router.get("/notifications", getMyNotifications);
router.patch("/notifications/:id/read", markRead);
router.delete("/notifications/:id", deleteNotification);

// Favorites
router.get("/favorites", getFavorites);
router.post("/favorites/:carId", addFavorite);
router.delete("/favorites/:carId", removeFavorite);

export default router;
