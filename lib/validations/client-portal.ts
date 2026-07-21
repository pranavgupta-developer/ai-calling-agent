import { z } from "zod";



export const ClientLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean(),
});

export type ClientLoginInput = z.infer<typeof ClientLoginSchema>;

export const UpdateClientProfileSchema = z.object({
  full_name: z.string().min(2, { message: "Name is required." }),
  phone: z.string().optional(),
  preferred_language: z.string().optional(),
});

export type UpdateClientProfileInput = z.infer<typeof UpdateClientProfileSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
