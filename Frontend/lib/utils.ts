// lib/validations.ts
// Zod validation schemas for MediConnect forms

import { z } from "zod";

// ─── LOGIN ───────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── SIGNUP ──────────────────────────────────────────────
export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  terms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
});

export type SignupFormData = z.infer<typeof signupSchema>;