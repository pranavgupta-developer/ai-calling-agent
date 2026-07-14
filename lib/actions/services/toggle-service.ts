"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleServiceStatus(serviceId: string, currentStatus: boolean) {
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

    // 3. Toggle service status
    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update({ active: !currentStatus })
      .eq("id", serviceId)
      .eq("agency_id", agencyId) // enforce agency ownership
      .select("active")
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return { error: `Failed to toggle service status: ${updateError.message}` };
    }

    revalidatePath("/dashboard/services");

    return { success: true, active: updatedService.active };
  } catch (error) {
    console.error("Toggle service error:", error);
    return { error: "An unexpected error occurred while toggling the service status." };
  }
}
