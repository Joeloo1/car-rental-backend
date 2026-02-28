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

export default router;
