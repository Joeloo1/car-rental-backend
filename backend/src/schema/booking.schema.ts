import { z } from "zod";

export const BookingStatusEnum = z.enum(["pending", "confirmed", "cancelled", "completed"]);

export const CreateBookingSchema = z.object({
  body: z
    .object({
      // Accept both YYYY-MM-DD (from <input type="date">) and full ISO strings
      startDate: z.coerce.date({ error: "Invalid startDate format" }),
      endDate: z.coerce.date({ error: "Invalid endDate format" }),
    })
    .refine((b) => b.endDate > b.startDate, {
      message: "End date must be after start date",
      path: ["endDate"],
    }),
  params: z.object({
    carId: z.string().uuid("Invalid car ID"),
  }),
});

export const UpdateBookingStatusSchema = z.object({
  body: z.object({
    status: BookingStatusEnum,
  }),
  params: z.object({
    id: z.string().uuid("Invalid booking ID"),
  }),
});

// body fields are coerced to Date by Zod
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>["body"];
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>["body"];
