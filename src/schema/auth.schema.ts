import { z } from "zod";

/*
 * Signup Schema
 */
export const SignupSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(2, "First name is required"),
      email: z.string().email("Invalid email address"),
      phoneNumber: z.string().optional(),
      password: z.string().min(8, "Password must be at least 8 characters"),
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
