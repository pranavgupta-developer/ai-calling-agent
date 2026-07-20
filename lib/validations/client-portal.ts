import { z } from "zod";

export const ClientSignupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
  name: z.string().min(2, { message: "Name is required." }),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ClientSignupInput = z.infer<typeof ClientSignupSchema>;

export const ClientLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional().default(false),
});

export type ClientLoginInput = z.infer<typeof ClientLoginSchema>;

export const UpdateClientProfileSchema = z.object({
  full_name: z.string().min(2, { message: "Name is required." }),
  phone: z.string().optional(),
  preferred_language: z.string().optional(),
});

export type UpdateClientProfileInput = z.infer<typeof UpdateClientProfileSchema>;
