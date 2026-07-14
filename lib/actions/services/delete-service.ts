"use server";

import { ServiceManager } from "@/lib/services/service-manager";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteService(id: string, source: 'DEFAULT' | 'OVERRIDE' | 'CUSTOM') {
  try {
    if (source === 'DEFAULT') {
      return { error: "Default templates cannot be deleted." };
    }

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

    if (source === 'OVERRIDE') {
      await ServiceManager.removeOverride(agencyId, id);
    } else {
      await ServiceManager.deleteCustomService(agencyId, id);
    }

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error: any) {
    console.error("Delete service error:", error);
    return { error: error.message || "Failed to delete service" };
  }
}
