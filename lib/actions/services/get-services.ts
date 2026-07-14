"use server";

import { createClient } from "@/lib/supabase/server";
import { Service } from "@/types/service";

export async function getServices() {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // 2. Find agency_id for the user
    let { data: agencies } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    let agencyId = agencies?.id;

    if (!agencyId) {
      const { data: agencyUser } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("auth_user_id", userId)
        .single();
      agencyId = agencyUser?.agency_id;
    }

    if (!agencyId) {
      return { error: "User is not associated with any agency." };
    }

    // 3. Fetch services for this agency
    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Supabase fetch error:", JSON.stringify(fetchError, null, 2));
      return { error: `Failed to fetch services: ${fetchError.message || JSON.stringify(fetchError)}` };
    }

    return { success: true, data: services as Service[] };
  } catch (error) {
    console.error("Get services error:", error);
    return { error: "An unexpected error occurred while fetching services." };
  }
}
