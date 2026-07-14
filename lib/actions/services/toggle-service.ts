"use server";

import { ServiceManager } from "@/lib/services/service-manager";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleService(id: string, source: 'DEFAULT' | 'OVERRIDE' | 'CUSTOM', currentStatus: boolean) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;
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

    const newStatus = !currentStatus;

    if (source === 'DEFAULT') {
      // Create an override just for the active status
      await ServiceManager.createOverride(agencyId, id, { active: newStatus });
    } else {
      // Both override and custom can use toggleService (which just updates active by ID)
      await ServiceManager.toggleService(agencyId, id, newStatus);
    }

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle service error:", error);
    return { error: error.message || "Failed to toggle service" };
  }
}
