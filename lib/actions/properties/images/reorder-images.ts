"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reorderPropertyImages(propertyId: string, imageIdsInOrder: string[]) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    // 2. Loop through the array and update the display_order sequentially
    // Supabase JS doesn't have bulk update out of the box, so we iterate
    // This is safe since the max images is 10.
    for (let i = 0; i < imageIdsInOrder.length; i++) {
      const id = imageIdsInOrder[i];
      const { error: updateError } = await supabase
        .from("property_images")
        .update({ display_order: i })
        .eq("id", id)
        .eq("property_id", propertyId); // extra safeguard

      if (updateError) {
        console.error("Reorder update error for image:", id, updateError);
        return { error: "Failed to update image order." };
      }
    }

    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Reorder property images error:", error);
    return { error: "An unexpected error occurred." };
  }
}
