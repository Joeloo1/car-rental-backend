import { z } from "zod";

/**
 * Car Status Enum
 */
export const CarStatusEnum = z.enum([
  "available",
  "rented",
  "maintenance",
  "unavailable",
]);

/**
 * CREATE CAR SCHEMA
 */
export const CreateCarSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z
      .number()
      .int()
      .min(1900, "Year must be 1900 or later")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .optional(),
    description: z.string().optional(),
    pricePerDay: z.number().positive("Price per day must be positive"),
    locationCity: z.string().optional(),
    availabilityStatus: CarStatusEnum.optional().default("available"),
    categoryId: z.number().int().positive("Invalid category ID"),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    seats: z.number().int().optional(),
    topSpeed: z.number().int().optional(),
    acceleration: z.string().optional(),
    enginePower: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});


/**
 * UPDATE CAR SCHEMA
 */
export const UpdateCarSchema = z.object({
  body: z.object({
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    seats: z.number().int().optional(),
    topSpeed: z.number().int().optional(),
    acceleration: z.string().optional(),
    enginePower: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    categoryId: z.number().int().positive("Invalid category ID").optional(),
  }),
});


/**
 * CAR PARAMS SCHEMA
 */
export const CarParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid car ID"),
  }),
});

/**
 * CAR QUERY FILTERS SCHEMA (for GET /cars)
 */
export const CarQuerySchema = z.object({
  query: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    minYear: z.coerce.number().int().optional(),
    maxYear: z.coerce.number().int().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),

    locationCity: z.string().optional(),
    availabilityStatus: CarStatusEnum.optional(),
    categoryId: z.coerce.number().int().positive().optional(),

    lenderId: z.string().uuid().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    seats: z.coerce.number().int().positive().optional(),

    sortBy: z

      .enum([
        "createdAt",
        "pricePerDay",
        "title",
        "year",
        "brand",
        "averageRating",
      ])
      .optional()
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});


/**
 * Types Inference
 */
export type CreateCarInput = z.infer<typeof CreateCarSchema>["body"];
export type UpdateCarInput = z.infer<typeof UpdateCarSchema>["body"];
export type CarParamsInput = z.infer<typeof CarParamsSchema>["params"];
export type CarQuery = z.infer<typeof CarQuerySchema>["query"];
