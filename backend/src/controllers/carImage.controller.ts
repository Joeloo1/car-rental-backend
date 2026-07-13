import { Response } from "express";
import {
  updateCarImageService,
  uploadCarImagesService,
  GetCarImagesService,
  BulkReorderImagesService,
  deleteCarImageService,
} from "../services/carImages.service";
import {
  uploadCarImageSchema,
  updateCarImageSchema,
  bulkReorderSchema,
} from "../schema/carImage.schema";
import { z } from "zod";
import catchAsync from "../utils/catchAsync";
import { AuthRequest } from "../types/authRequest";

export const uploadImages = catchAsync(async (req: AuthRequest, res: Response) => {
  const validatedData = uploadCarImageSchema.parse({
    carId: req.params.carId,
    isMain: req.body.isMain,
    order: req.body.order,
  });

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: "No images provided" });
    return;
  }

  const { uploadedImages, failedCount } = await uploadCarImagesService(
    validatedData.carId,
    req.user!.id,
    files,
    validatedData.isMain,
    validatedData.order,
  );

  res.status(201).json({
    success: true,
    message: `${uploadedImages.length} image(s) uploaded successfully${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
    data: uploadedImages,
    ...(failedCount > 0 && { failedCount }),
  });
});

export const getImages = catchAsync(async (req: AuthRequest, res: Response) => {
  const { carId } = z.object({ carId: z.string().uuid() }).parse(req.params);
  const images = await GetCarImagesService(carId);

  res.status(200).json({ success: true, data: images });
});

export const updateImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { carId, imageId } = z
    .object({ carId: z.string().uuid(), imageId: z.string().uuid() })
    .parse(req.params);

  const updates = updateCarImageSchema.parse(req.body);
  const isAdmin = req.user!.role === "admin";

  const image = await updateCarImageService(carId, imageId, req.user!.id, isAdmin, updates);

  res.status(200).json({ success: true, message: "Image updated successfully", data: image });
});

export const bulkReorder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { carId } = z.object({ carId: z.string().uuid() }).parse(req.params);
  const reorderData = bulkReorderSchema.parse(req.body);
  const isAdmin = req.user!.role === "admin";

  const images = await BulkReorderImagesService(carId, req.user!.id, isAdmin, reorderData);

  res.status(200).json({ success: true, message: "Images reordered successfully", data: images });
});

export const deleteImage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { carId, imageId } = z
    .object({ carId: z.string().uuid(), imageId: z.string().uuid() })
    .parse(req.params);

  const isAdmin = req.user!.role === "admin";

  await deleteCarImageService(carId, imageId, req.user!.id, isAdmin);

  res.status(200).json({ success: true, message: "Image deleted successfully" });
});
