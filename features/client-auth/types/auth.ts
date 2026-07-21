import { z } from "zod";
import { ClientSignupSchema } from "../schemas/signup.schema";

export type ClientSignupInput = z.infer<typeof ClientSignupSchema>;

export interface AuthResponse {
  success?: boolean;
  error?: string;
}

export interface ClientProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}
