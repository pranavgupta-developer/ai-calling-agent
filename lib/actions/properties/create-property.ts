"use server";

import { createClient } from "@/lib/supabase/server";
import { propertyFormSchema, type PropertyFormValues } from "@/lib/validations/property";
import { revalidatePath } from "next/cache";

export async function createProperty(data: PropertyFormValues) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;

    // 2. Validate data
    const parsedData = propertyFormSchema.safeParse(data);
    if (!parsedData.success) {
      return { error: "Invalid form data. Please check the fields." };
    }

    // 3. Find agency_id for the user
    // First, check if the user is an agency owner
    let { data: agencies } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    let agencyId = agencies?.id;

    // If not an owner, check agency_users
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

    // 4. Insert property
    const { data: newProperty, error: insertError } = await supabase
      .from("properties")
      .insert({
        ...parsedData.data,
        agency_id: agencyId,
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { error: `Failed to create listing: ${insertError.message}` };
    }

    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard/properties");

    return { success: true, data: newProperty };
  } catch (error) {
    console.error("Create property error:", error);
    return { error: "An unexpected error occurred." };
  }
}
