"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { UpdateClientProfileSchema } from "@/lib/validations/client-portal";
import { ClientProfile } from "@/types/client-portal";

export async function getClientProfile(): Promise<{
  data: ClientProfile | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name, email, phone, preferred_language, notes")
    .limit(1)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || "Profile not found." };
  }

  return { data, error: null };
}

export async function updateClientProfile(
  data: z.infer<typeof UpdateClientProfileSchema>
): Promise<{ error: string | null }> {
  const result = UpdateClientProfileSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.message };
  }

  const supabase = await createClient();

  // Retrieve the client id using the RLS which restricts to the user's clients
  const { data: clients, error: fetchError } = await supabase
    .from("clients")
    .select("id")
    .limit(1);

  if (fetchError || !clients || clients.length === 0) {
    return { error: "Profile not found." };
  }

  const clientId = clients[0].id;

  const { error } = await supabase
    .from("clients")
    .update({
      full_name: result.data.full_name,
      phone: result.data.phone || null,
      preferred_language: result.data.preferred_language || "en",
    })
    .eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
