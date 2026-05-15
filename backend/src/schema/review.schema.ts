import z from "zod";

/**
 * Schema for creating a review
 */
export const createReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),
    comment: z
      .string()
      .trim()
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment cannot exceed 500 characters")
      .optional(),
  }),
});

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
  body: z
    .object({
      rating: z
        .number()
        .int("Rating must be an integer")
        .min(1)
        .max(5)
        .optional(),
      comment: z.string().trim().min(3).max(500).optional(),
    })
    .refine((data) => data.rating !== undefined || data.comment !== undefined, {
      message: "At least one field must be provided",
    }),
});

/**
 * Car route params
 */
export const carParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid car ID"),
  }),
});

/**
 * Review route params
 */
export const reviewParamsSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid("Invalid review ID"),
  }),
});

/*
 * Type Inference
 */
export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>["body"];
export type CarParamsInput = z.infer<typeof carParamsSchema>["params"];
export type ReviewParamsInput = z.infer<typeof reviewParamsSchema>["params"];
