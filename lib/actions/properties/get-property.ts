"use server";

import { createClient } from "@/lib/supabase/server";
import { PropertyFormValues } from "@/lib/validations/property";

export async function getProperty(id: string) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    // Fetch property (RLS ensures they can only read if it belongs to their agency)
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !property) {
      console.error("Supabase fetch error:", fetchError);
      return { error: "Property not found or access denied." };
    }

    return { data: property as PropertyFormValues & { id: string } };
  } catch (error) {
    console.error("Get property error:", error);
    return { error: "An unexpected error occurred." };
  }
}
