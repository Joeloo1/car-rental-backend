import cloudinary from "../config/cloudinary";
import { prisma } from "../config/database";
import {
  CloudinaryUploadResult,
  UploadedImage,
} from "../types/carImages.types";
import { Readable } from "stream";
import { BulkReorderInput } from "../schema/carImage.schema";
import logger from "../config/winston";
import AppError from "../utils/AppError";

/**
 * Helper to covert buffer to stream
 */
const bufferToStreams = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Upload single image to Cloudinary
 */
const UploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as CloudinaryUploadResult);
      },
    );

    bufferToStreams(buffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple car images
 */
export const uploadCarImagesService = async (
  carId: string,
  files: Express.Multer.File[],
  isMain?: boolean,
  order?: number,
): Promise<UploadedImage[]> => {
  // Verify car exists
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) {
    throw new Error("Car not found");
  }

  // Check if car already has images
  const existingImages = await prisma.carImage.count({ where: { carId } });
  if (existingImages >= 10) {
    throw new Error("Maximum 10 images allowed per car");
  }

  const maxUpload = 10 - existingImages;
  const filesToUpload = files.slice(0, maxUpload);

  // Determine starting order
  let nextOrder = order ?? 0;
  if (order === undefined) {
    const maxOrderResult = await prisma.carImage.findFirst({
      where: { carId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    nextOrder = (maxOrderResult?.order ?? -1) + 1;
  }

  // Check if there's already a main image
  const hasMainImage = await prisma.carImage.findFirst({
    where: { carId, isMain: true },
  });

  // If isMain is explicitly set to true, unset existing main images
  if (isMain && hasMainImage) {
    await prisma.carImage.updateMany({
      where: { carId, isMain: true },
      data: { isMain: false },
    });
  }

  const uploadedImages: UploadedImage[] = [];

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    try {
      // Upload to Cloudinary
      const result = await UploadToCloudinary(file.buffer, `cars/${carId}`);

      // Determine if this should be main
      const shouldBeMain =
        (isMain === true && i === 0) || // First image when isMain is true
        (!hasMainImage && uploadedImages.length === 0 && isMain !== false); // First image overall when no main exists

      // Save to database
      const carImage = await prisma.carImage.create({
        data: {
          carId,
          imageUrl: result.secure_url,
          publicId: result.public_id,
          isMain: shouldBeMain,
          order: nextOrder + i,
        },
      });

      uploadedImages.push(carImage);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }
  return uploadedImages;
};

/**
 * Get car Images
 */
export const GetCarImagesService = async (
  carId: string,
): Promise<UploadedImage[]> => {
  return await prisma.carImage.findMany({
    where: { carId },
    orderBy: { order: "desc" },
  });
};

/**
 * Upload a single car image
 */
export const updateCarImageService = async (
  carId: string,
  imageId: string,
  updates: { isMain?: boolean; order?: number },
): Promise<UploadedImage> => {
  // Check if image belong to car
  const image = await prisma.carImage.findFirst({
    where: { id: imageId, carId },
  });

  if (!image) {
    logger.warn("Image nor found for this car", { carId });
    throw new AppError("Image not found for this car", 404);
  }
  // If setting as main, unset other main images
  if (updates.isMain === true) {
    await prisma.carImage.updateMany({
      where: { carId, isMain: true, id: { not: imageId } },
      data: { isMain: false },
    });
  }

  // Upload the image
  return await prisma.carImage.update({
    where: { id: imageId },
    data: updates,
  });
};

/**
 *  Bulk Reorder images
 */
export const BulkReorderImagesService = async (
  carId: string,
  data: BulkReorderInput,
): Promise<UploadedImage[]> => {
  const imageIds = data.images.map((img) => img.id);
  const images = await prisma.carImage.findMany({
    where: { id: { in: imageIds }, carId },
  });

  if (images.length !== imageIds.length) {
    throw new AppError("Some images not found for this car", 400);
  }

  // update order for each images
  const updatePromises = data.images.map((img) =>
    prisma.carImage.update({
      where: { id: img.id },
      data: { order: img.order },
    }),
  );

  return await Promise.all(updatePromises);
};

/**
 * Delete image
 */
export const deleteCarImageService = async (
  carId: string,
  imageId: string,
): Promise<void> => {
  const image = await prisma.carImage.findFirst({
    where: { id: imageId, carId },
  });

  if (!image) {
    throw new Error("Image not found for this car");
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(image.publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }

  // Delete from database
  await prisma.carImage.delete({ where: { id: imageId } });

  // If deleted image was main, set another as main
  if (image.isMain) {
    const firstImage = await prisma.carImage.findFirst({
      where: { carId },
      orderBy: { order: "asc" },
    });

    if (firstImage) {
      await prisma.carImage.update({
        where: { id: firstImage.id },
        data: { isMain: true },
      });
    }
  }
};
