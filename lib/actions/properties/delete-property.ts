"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProperty(id: string) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { error: "Unauthorized" };

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete property error:", error);
      return { error: "Failed to delete property." };
    }

    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error) {
    console.error("Delete property exception:", error);
    return { error: "An unexpected error occurred." };
  }
}
