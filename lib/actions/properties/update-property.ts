"use server";

import { createClient } from "@/lib/supabase/server";
import { propertyFormSchema, type PropertyFormValues } from "@/lib/validations/property";
import { revalidatePath } from "next/cache";

export async function updateProperty(id: string, data: PropertyFormValues) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    // 2. Validate data
    const parsedData = propertyFormSchema.safeParse(data);
    if (!parsedData.success) {
      return { error: "Invalid form data. Please check the fields." };
    }

    // 3. Update property (RLS will ensure they can only update if they belong to the agency)
    const { data: updatedProperty, error: updateError } = await supabase
      .from("properties")
      .update(parsedData.data)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return { error: "Failed to update listing." };
    }

    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard/properties");
    revalidatePath(`/dashboard/properties/${id}/edit`);

    return { success: true, data: updatedProperty };
  } catch (error) {
    console.error("Update property error:", error);
    return { error: "An unexpected error occurred." };
  }
}
