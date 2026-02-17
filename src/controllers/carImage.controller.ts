import { Request, Response, NextFunction } from "express";
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

export const uploadImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request
    const validatedData = uploadCarImageSchema.parse({
      carId: req.params.carId,
      isMain: req.body.isMain,
      order: req.body.order,
    });

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No images provided",
      });
      return;
    }

    const images = await uploadCarImagesService(
      validatedData.carId,
      files,
      validatedData.isMain,
      validatedData.order,
    );

    res.status(201).json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      data: images,
    });
  },
);

export const getImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { carId } = z.object({ carId: z.string().uuid() }).parse(req.params);
    const images = await GetCarImagesService(carId);

    res.status(200).json({
      success: true,
      data: images,
    });
  },
);

export const updateImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { carId, imageId } = z
      .object({
        carId: z.string().uuid(),
        imageId: z.string().uuid(),
      })
      .parse(req.params);

    const updates = updateCarImageSchema.parse(req.body);
    console.log("BODY:", req.body);

    const image = await updateCarImageService(carId, imageId, updates);

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: image,
    });
  },
);

export const bulkReorder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { carId } = z.object({ carId: z.string().uuid() }).parse(req.params);
    const reorderData = bulkReorderSchema.parse(req.body);

    const images = await BulkReorderImagesService(carId, reorderData);

    res.status(200).json({
      success: true,
      message: "Images reordered successfully",
      data: images,
    });
  },
);

export const deleteImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { carId, imageId } = z
      .object({
        carId: z.string().uuid(),
        imageId: z.string().uuid(),
      })
      .parse(req.params);

    await deleteCarImageService(carId, imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  },
);
