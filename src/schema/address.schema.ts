import { z } from "zod";

/**
 * CREATE ADDRESS SCHEMA
 */
export const CreateAddressSchema = z.object({
  body: z.object({
    street: z.string().min(2, "Street must be at least 2 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().optional(),
    country: z.string().min(2, "Country is required"),
    latitude: z.number().min(-90).max(90).optional(), // Changed from float64
    longitude: z.number().min(-180).max(180).optional(), // Changed from float64
  }),
}); /**
 * UPDATE ADDRESS SCHEMA
 */
export const UpdateAddressSchema = z.object({
  body: z.object({
    street: z
      .string()
      .min(2, "Street must be at least 2 characters")
      .optional(),
    city: z.string().min(2, "City must be at least 2 characters").optional(),
    state: z.string().optional(),
    country: z.string().min(2, "Country is required").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

/*
 *  Params Schema
 */
export const AddressParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive("ID must be a positive integer")),
  }),
});
/*
 * Type Inferene
 */
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>["body"];
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>["body"];
export type AddressParamsInput = z.infer<typeof AddressParamsSchema>["params"];
