"use server";

import { createClient } from "@/lib/supabase/server";
import { updateServiceSchema, type UpdateServiceValues } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function updateService(serviceId: string, data: UpdateServiceValues) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // 2. Validate data
    const parsedData = updateServiceSchema.safeParse(data);
    if (!parsedData.success) {
      return { error: "Invalid form data. Please check the fields." };
    }

    // 3. Find agency_id for the user
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

    // 4. Update service (RLS will ensure they only update their own agency's services)
    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update(parsedData.data as any)
      .eq("id", serviceId)
      .eq("agency_id", agencyId) // extra check in query
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return { error: `Failed to update service: ${updateError.message}` };
    }

    revalidatePath("/dashboard/services");

    return { success: true, data: updatedService };
  } catch (error) {
    console.error("Update service error:", error);
    return { error: "An unexpected error occurred while updating the service." };
  }
}
