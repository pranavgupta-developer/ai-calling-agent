"use server";

import { ServiceManager } from "@/lib/services/service-manager";
import { createClient } from "@/lib/supabase/server";
import { MergedService } from "@/types/service";

export async function getServices() {
  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // Resolve agency_id. Typically this logic might live in middleware or higher level, but keeping it here.
    let { data: agencies } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    let agencyId = agencies?.id;

    if (!agencyId) {
      let { data: agencyUser } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("auth_user_id", userId)
        .single();
      agencyId = agencyUser?.agency_id;
    }

    if (!agencyId) {
      return { error: "Agency not found" };
    }

    const services = await ServiceManager.getMergedServices(agencyId);

    return { success: true, data: services };
  } catch (error: any) {
    console.error("Failed to fetch services:", error);
    return { error: error.message || "Failed to fetch services" };
  }
}
