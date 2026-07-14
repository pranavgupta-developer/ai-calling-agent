"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteService(serviceId: string) {
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

    // 3. Fetch service to ensure it's not a template
    const { data: service, error: fetchError } = await supabase
      .from("services")
      .select("is_template, agency_id")
      .eq("id", serviceId)
      .single();

    if (fetchError || !service) {
      return { error: "Service not found." };
    }

    if (service.agency_id !== agencyId) {
      return { error: "Unauthorized to delete this service." };
    }

    if (service.is_template) {
      return { error: "Cannot delete a seeded template service." };
    }

    // 4. Delete service
    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("agency_id", agencyId); // Double check

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return { error: `Failed to delete service: ${deleteError.message}` };
    }

    revalidatePath("/dashboard/services");

    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { error: "An unexpected error occurred while deleting the service." };
  }
}
