import { z } from "zod";

export const ClientSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ClientSignupInput = z.infer<typeof ClientSignupSchema>;
