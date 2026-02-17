import { z } from "zod";

/**
 * Schema for uploading a car image
 */
export const uploadCarImageSchema = z.object({
  carId: z.string().uuid("Invalid car ID"),
  isMain: z.coerce.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Schema for updating a car image
 */
export const updateCarImageSchema = z.object({
  isMain: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Schema for bulk reordering images
 */
export const bulkReorderSchema = z.object({
  images: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int().min(0),
      }),
    )
    .min(1, "At least one image required")
    .max(100, "Maximum 100 images can be reordered at once"),
});

/**
 * Types Interene
 */
export type UploadCarImageInput = z.infer<typeof uploadCarImageSchema>;
export type UpdateCarImageInput = z.infer<typeof updateCarImageSchema>;
export type BulkReorderInput = z.infer<typeof bulkReorderSchema>;
