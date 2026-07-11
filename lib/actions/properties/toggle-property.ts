"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePropertyActive(id: string, isActive: boolean) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { error: "Unauthorized" };

    const { error } = await supabase
      .from("properties")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error("Toggle active error:", error);
      return { error: "Failed to update active status." };
    }

    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error) {
    console.error("Toggle active exception:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function togglePropertyFeatured(id: string, isFeatured: boolean) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { error: "Unauthorized" };

    const { error } = await supabase
      .from("properties")
      .update({ is_featured: isFeatured })
      .eq("id", id);

    if (error) {
      console.error("Toggle featured error:", error);
      return { error: "Failed to update featured status." };
    }

    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error) {
    console.error("Toggle featured exception:", error);
    return { error: "An unexpected error occurred." };
  }
}
