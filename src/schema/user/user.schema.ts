import z from "zod";
import { Role } from "../../types/role.types";
import { AccountStatus } from "@prisma/client";

/**
 * User Update Schema
 */
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    profileImage: z
      .string()
      .url({ message: "Invalid URL format for profile image" })
      .optional(),
  }),
});

/**
 * Admin User Update Schema
 */
export const adminUpdateUserSchema = z.object({
  body: z
    .object({
      role: z.enum([Role.USER, Role.LENDER, Role.Admin]).optional(),
      accountStatus: z.nativeEnum(AccountStatus).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided to update",
    }),
});

/*
 * Type Inference
 */
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type AdminUpdateUserInput = z.infer<
  typeof adminUpdateUserSchema
>["body"];
