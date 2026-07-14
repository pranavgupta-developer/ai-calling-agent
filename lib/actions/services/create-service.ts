"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceSchema, type CreateServiceValues } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function createService(data: CreateServiceValues) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // 2. Validate data
    const parsedData = createServiceSchema.safeParse(data);
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

    // 4. Check for duplicate service name within the same agency
    const { data: existingService } = await supabase
      .from("services")
      .select("id")
      .eq("agency_id", agencyId)
      .ilike("name", parsedData.data.name)
      .single();

    if (existingService) {
      return { error: "A service with this name already exists in your agency." };
    }

    // 5. Insert service
    const { data: newService, error: insertError } = await supabase
      .from("services")
      .insert({
        ...parsedData.data,
        agency_id: agencyId,
        is_template: false, // Custom services are not templates
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { error: `Failed to create service: ${insertError.message}` };
    }

    revalidatePath("/dashboard/services");

    return { success: true, data: newService };
  } catch (error) {
    console.error("Create service error:", error);
    return { error: "An unexpected error occurred while creating the service." };
  }
}
