import { Router } from "express";
import {
  uploadImages,
  getImages,
  bulkReorder,
  updateImage,
  deleteImage,
} from "../controllers/carImage.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { protect } from "../middleware/protect.middleware";
import { restrictTo } from "../middleware/authorization";
import { Role } from "../types/role.types";

const router = Router({ mergeParams: true });

router.get("/", getImages);

router.use(protect);

router.post(
  "/",
  restrictTo(Role.LENDER, Role.Admin),
  uploadMiddleware.array("images", 10),
  uploadImages,
);

router.patch("/reorder", restrictTo(Role.LENDER, Role.Admin), bulkReorder);

router.put("/:imageId", restrictTo(Role.LENDER, Role.Admin), updateImage);

router.delete("/:imageId", restrictTo(Role.LENDER, Role.Admin), deleteImage);

/**
 * GET /api/cars/:carId/images
 * Retrieve all images for a specific car listing ordered by the order field
 * Params: { carId: string (uuid) }
 * Protection: PUBLIC
 */
router.get("/", getImages);

// Apply protect middleware to all routes below this line
router.use(protect);

/**
 * POST /api/cars/:carId/images
 * Upload one or more images for a specific car listing (max 10 images per car)
 * Params: { carId: string (uuid) }
 * Body: multipart/form-data { images: File[], isMain?: boolean, order?: number }
 * Validates request against uploadCarImageSchema
 * Protection: PROTECTED (Lender and Admin only)
 */
router.post(
  "/",
  restrictTo(Role.LENDER, Role.Admin),
  uploadMiddleware.array("images", 10),
  uploadImages,
);

/**
 * PATCH /api/cars/:carId/images/reorder
 * Bulk reorder images for a specific car listing (max 100 images at once)
 * Params: { carId: string (uuid) }
 * Body: { images: { id: string, order: number }[] }
 * Validates request against bulkReorderSchema
 * Protection: PROTECTED (Lender and Admin only)
 */
router.put("/reorder", restrictTo(Role.LENDER, Role.Admin), bulkReorder);

/**
 * PUT /api/cars/:carId/images/:imageId
 * Update a specific car image (set as main image or update order)
 * Params: { carId: string (uuid), imageId: string (uuid) }
 * Body: { isMain?: boolean, order?: number }
 * Validates request against updateCarImageSchema
 * Protection: PROTECTED (Lender and Admin only)
 */
router.patch("/:imageId", restrictTo(Role.LENDER, Role.Admin), updateImage);

/**
 * DELETE /api/cars/:carId/images/:imageId
 * Delete a specific car image from both Cloudinary and the database
 * If the deleted image was the main image, automatically promotes the next image
 * Params: { carId: string (uuid), imageId: string (uuid) }
 * Protection: PROTECTED (Lender and Admin only)
 */
router.delete("/:imageId", restrictTo(Role.LENDER, Role.Admin), deleteImage);

export default router;
