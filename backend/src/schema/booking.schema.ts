import { z } from "zod";

export const BookingStatusEnum = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const CreateBookingSchema = z.object({
  body: z.object({
    startDate: z.string().datetime({ message: "Invalid startDate format" }).or(z.date()),
    endDate: z.string().datetime({ message: "Invalid endDate format" }).or(z.date()),
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

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>["body"];
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>["body"];
