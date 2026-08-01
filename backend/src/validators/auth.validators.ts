import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  phone: z.string().min(9).max(15),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  phone: z.string().min(9).max(15),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(9).max(15),
  code: z.string().length(6),
});
