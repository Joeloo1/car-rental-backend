import { z } from "zod";

/*
 * Signup Schema
 */
export const SignupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .trim(),
      email: z.string().email("Invalid email address"),
      phoneNumber: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
        .optional(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
      passwordConfirm: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"],
    }),
});

/*
 * Login Schema
 */
export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

/*
 * Type Inference
 */
export type SignupInput = z.infer<typeof SignupSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
