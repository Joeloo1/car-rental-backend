import { z } from "zod";

/*
 * Create Category
 */
export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, "Category name is required").max(100),
  }),
});

/*
 * Update Category
 */
export const UpdateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a valid number"),
  }),
  body: z.object({
    name: z.string().min(3, "Category name is required").max(100).optional(),
  }),
});

/*
 *  Params Schema
 */
export const CategoryParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive()),
  }),
});

/*
 * Type Inferene
 */
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>["body"];
export type CategoryParams = z.infer<typeof CategoryParamsSchema>["params"];
