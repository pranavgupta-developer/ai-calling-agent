"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ClientSignupSchema, ClientLoginSchema } from "@/lib/validations/client-portal";
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

export async function clientSignUp(
  data: z.infer<typeof ClientSignupSchema>
) {
  const result = ClientSignupSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, name, phone } = result.data;
  const serviceSupabase = getServiceSupabase();

  // 1. Verify email exists in at least one appointment
  const { data: clientRecords, error: clientErr } = await serviceSupabase
    .from("clients")
    .select("id")
    .eq("email", email);

  if (clientErr || !clientRecords || clientRecords.length === 0) {
    return { error: "No appointment found with this email. Please contact the agency." };
  }

  // We should specifically check if these clients have appointments, but if they exist as clients,
  // it might be enough. Let's strictly check appointments:
  const clientIds = clientRecords.map(c => c.id);
  const { data: appointmentRecords } = await serviceSupabase
    .from("appointments")
    .select("id")
    .in("client_id", clientIds)
    .limit(1);

  if (!appointmentRecords || appointmentRecords.length === 0) {
    return { error: "No appointment found with this email. Please contact the agency." };
  }

  // 2. Proceed with signup
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
            // Server action might be called from a Client Component context where setting cookies isn't allowed.
          }
        },
      },
    }
  );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
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
    return { error: "An unexpected error occurred during signup." };
  }

  // 3. Link the user to the client records
  const clientUserInserts = clientIds.map(clientId => ({
    auth_user_id: userId,
    client_id: clientId,
  }));

  const { error: insertError } = await serviceSupabase
    .from("client_users")
    .insert(clientUserInserts);

  if (insertError) {
    // Ideally rollback auth user creation if this fails
    return { error: "Failed to link account to existing appointments." };
  }

  redirect("/client/dashboard");
}

export async function clientLogin(
  data: z.infer<typeof ClientLoginSchema>
) {
  const result = ClientLoginSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/client/dashboard");
}
