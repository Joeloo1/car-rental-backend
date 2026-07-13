import cloudinary from "../config/cloudinary";
import { prisma } from "../config/database";
import { CloudinaryUploadResult, UploadedImage } from "../types/carImages.types";
import { Readable } from "stream";
import { BulkReorderInput } from "../schema/carImage.schema";
import logger from "../config/winston";
import AppError from "../utils/AppError";
import { validateImageBytes } from "../middleware/upload.middleware";

const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const CLOUDINARY_TIMEOUT_MS = 15_000;

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<CloudinaryUploadResult> => {
  const upload = new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
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
    bufferToStream(buffer).pipe(stream);
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new AppError("Image service is temporarily unavailable. Try again later.", 503)),
      CLOUDINARY_TIMEOUT_MS,
    ),
  );

  return Promise.race([upload, timeout]);
};

const assertCarOwnership = async (carId: string, userId: string, isAdmin: boolean): Promise<void> => {
  const car = await prisma.car.findUnique({ where: { id: carId }, select: { lenderId: true } });
  if (!car) throw new AppError("Car not found", 404);
  if (!isAdmin && car.lenderId !== userId) {
    throw new AppError("You can only manage images for your own cars", 403);
  }
};

export const uploadCarImagesService = async (
  carId: string,
  lenderId: string,
  files: Express.Multer.File[],
  isMain?: boolean,
  order?: number,
): Promise<{ uploadedImages: UploadedImage[]; failedCount: number }> => {
  const car = await prisma.car.findUnique({ where: { id: carId }, select: { lenderId: true } });
  if (!car) throw new AppError("Car not found", 404);
  if (car.lenderId !== lenderId) throw new AppError("You can only upload images to your own cars", 403);

  const existingCount = await prisma.carImage.count({ where: { carId } });
  if (existingCount >= 10) throw new AppError("Maximum 10 images allowed per car", 400);

  const maxUpload = 10 - existingCount;
  const filesToUpload = files.slice(0, maxUpload);

  // Auto-increment order from current max when caller doesn't specify
  let nextOrder = order;
  if (nextOrder === undefined) {
    const maxOrderRow = await prisma.carImage.findFirst({
      where: { carId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    nextOrder = (maxOrderRow?.order ?? -1) + 1;
  }

  const hasMainImage = await prisma.carImage.findFirst({ where: { carId, isMain: true } });

  if (isMain && hasMainImage) {
    await prisma.carImage.updateMany({ where: { carId, isMain: true }, data: { isMain: false } });
  }

  const uploadedImages: UploadedImage[] = [];
  const failedIndexes: number[] = [];

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    try {
      validateImageBytes(file.buffer);
      const result = await uploadToCloudinary(file.buffer, `cars/${carId}`);

      const shouldBeMain =
        (isMain === true && i === 0) ||
        (!hasMainImage && uploadedImages.length === 0 && isMain !== false);

      const carImage = await prisma.carImage.create({
        data: {
          carId,
          imageUrl: result.secure_url,
          publicId: result.public_id,
          isMain: shouldBeMain,
          order: nextOrder! + i,
        },
      });

      uploadedImages.push(carImage);
    } catch (error) {
      logger.error("Cloudinary upload failed", { error, index: i, carId });
      failedIndexes.push(i);
    }
  }

  if (failedIndexes.length > 0) {
    logger.warn(`${failedIndexes.length} image(s) failed to upload`, { failedIndexes, carId });
  }

  return { uploadedImages, failedCount: failedIndexes.length };
};

export const GetCarImagesService = async (carId: string): Promise<UploadedImage[]> => {
  return prisma.carImage.findMany({
    where: { carId },
    orderBy: [{ isMain: "desc" }, { order: "asc" }],
  });
};

export const updateCarImageService = async (
  carId: string,
  imageId: string,
  userId: string,
  isAdmin: boolean,
  updates: { isMain?: boolean; order?: number },
): Promise<UploadedImage> => {
  await assertCarOwnership(carId, userId, isAdmin);

  const image = await prisma.carImage.findFirst({ where: { id: imageId, carId } });
  if (!image) throw new AppError("Image not found for this car", 404);

  if (updates.isMain === true) {
    await prisma.carImage.updateMany({
      where: { carId, isMain: true, id: { not: imageId } },
      data: { isMain: false },
    });
  }

  return prisma.carImage.update({ where: { id: imageId }, data: updates });
};

export const BulkReorderImagesService = async (
  carId: string,
  userId: string,
  isAdmin: boolean,
  data: BulkReorderInput,
): Promise<UploadedImage[]> => {
  await assertCarOwnership(carId, userId, isAdmin);

  const imageIds = data.images.map((img) => img.id);
  const images = await prisma.carImage.findMany({ where: { id: { in: imageIds }, carId } });

  if (images.length !== imageIds.length) {
    throw new AppError("Some images were not found for this car", 400);
  }

  return prisma.$transaction(
    data.images.map((img) =>
      prisma.carImage.update({ where: { id: img.id }, data: { order: img.order } }),
    ),
  );
};

export const deleteCarImageService = async (
  carId: string,
  imageId: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> => {
  await assertCarOwnership(carId, userId, isAdmin);

  const image = await prisma.carImage.findFirst({ where: { id: imageId, carId } });
  if (!image) throw new AppError("Image not found for this car", 404);

  try {
    await cloudinary.uploader.destroy(image.publicId);
  } catch (error) {
    logger.error("Failed to delete image from Cloudinary", { error, publicId: image.publicId });
  }

  await prisma.carImage.delete({ where: { id: imageId } });

  // Promote the next image to main if the deleted one was main
  if (image.isMain) {
    const next = await prisma.carImage.findFirst({ where: { carId }, orderBy: { order: "asc" } });
    if (next) {
      await prisma.carImage.update({ where: { id: next.id }, data: { isMain: true } });
    }
  }
};
