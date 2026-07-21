"use server";

import { createClient } from "@/lib/supabase/server";
import { clientLoginSchema, ClientLoginValues } from "@/lib/validations/client-auth";

export type AuthResponse = {
  success?: boolean;
  error?: string;
  redirectTo?: string;
};

export async function loginClientAction(
  values: ClientLoginValues
): Promise<AuthResponse> {
  try {
    const validatedFields = clientLoginSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid credentials." };
    }

    const { email, password } = validatedFields.data;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Handle unverified email explicitly if supabase returns it
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        return { error: "Please verify your email before logging in." };
      }
      
      // Generic error to prevent brute force / email discovery
      return { error: "Invalid login credentials." };
    }

    if (!authData.user) {
      return { error: "An unexpected error occurred." };
    }

    const userId = authData.user.id;

    // Check if the user is a client
    const { data: clientData } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (clientData) {
      return { success: true, redirectTo: "/client/dashboard" };
    }

    // Check if the user is an agency user
    const { data: agencyData } = await supabase
      .from("agency_users")
      .select("agency_id, agencies(is_onboarding_completed)")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (agencyData) {
      const isCompleted = (agencyData.agencies as unknown as { is_onboarding_completed: boolean })?.is_onboarding_completed;
      return { success: true, redirectTo: isCompleted ? "/dashboard" : "/onboarding" };
    }

    // No roles matched
    return { success: true, redirectTo: "/onboarding" };

  } catch (error) {
    console.error("Login Error:", error);
    return { error: "An unexpected network error occurred." };
  }
}
