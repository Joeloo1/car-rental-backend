import { Router } from "express";
import {
  uploadImages,
  getImages,
  bulkReorder,
  updateImage,
  deleteImage,
} from "../controllers/carImage.controller";
import { uploadCarImagesMiddleware } from "../middleware/upload.middleware";
import { protect } from "../middleware/protect.middleware";
import { restrictTo } from "../middleware/authorization";
import { UserRole } from "../generated/prisma";

const router: Router = Router({ mergeParams: true });

// Public
router.get("/", getImages);

// Protected — lender and admin only
router.use(protect);
router.use(restrictTo(UserRole.admin, UserRole.lender));

router.post("/", uploadCarImagesMiddleware.array("images", 10), uploadImages);
router.patch("/reorder", bulkReorder);
router.patch("/:imageId", updateImage);
router.delete("/:imageId", deleteImage);

export default router;
