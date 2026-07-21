"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ClientSignupSchema } from "../schemas/signup.schema";
import { AuthResponse } from "../types/auth";
import { createClient } from "@supabase/supabase-js";

// Helper to get service role client for admin tasks
const getServiceSupabase = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function signupClient(formData: unknown): Promise<AuthResponse> {
  // 1. Validate input
  const result = ClientSignupSchema.safeParse(formData);
  
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { fullName, email, phone, password } = result.data;
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore error
          }
        },
      },
    }
  );

  const serviceSupabase = getServiceSupabase();

  // Pre-check if client profile already exists by email
  const { data: existingProfile, error: profileCheckError } = await serviceSupabase
    .from("client_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle(); // Use maybeSingle to avoid 406 Not Acceptable error if no rows

  if (profileCheckError) {
    console.error("Profile check error:", profileCheckError);
    return { error: "Unable to verify existing account. Please try again." };
  }

  if (existingProfile) {
    return { error: "An account with this email already exists." };
  }

  // Pre-check if auth.users already has this email (to prevent orphaned users from returning fake IDs)
  const { data: existingAuthUser } = await serviceSupabase.auth.admin.listUsers();
  const authUserExists = existingAuthUser?.users?.find(u => u.email === email);
  if (authUserExists) {
    // If they exist in auth but not in client_profiles, it's an orphaned account.
    // For now, we can either tell them they have an account, or delete the orphaned account.
    // Since this is a new signup module, let's clean up the orphaned account so they can sign up properly.
    await serviceSupabase.auth.admin.deleteUser(authUserExists.id);
  }

  // 2. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || "",
        role: "CLIENT",
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Unable to create account. Please try again." };
  }

  try {
    // 3. Create client_profiles record
    const { data: profileData, error: profileError } = await serviceSupabase
      .from("client_profiles")
      .insert({
        auth_user_id: userId,
        full_name: fullName,
        email: email,
        phone: phone || null,
        profile_completed: true,
      })
      .select("id")
      .single();

    if (profileError) throw profileError;

    // 4. Create client_users mapping
    const { error: mappingError } = await serviceSupabase
      .from("client_users")
      .insert({
        auth_user_id: userId,
        profile_id: profileData.id,
        // client_id is left null initially until they book an appointment
      });

    if (mappingError) throw mappingError;

    return { success: true };
  } catch (error) {
    console.error("Signup transaction failed:", error);
    
    // 5. Handle rollback if database insert fails
    if (userId) {
      await serviceSupabase.auth.admin.deleteUser(userId);
    }
    
    // Never expose database errors
    return { error: "Unable to create account. Please try again." };
  }
}
