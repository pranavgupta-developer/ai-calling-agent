"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Agency, OperatingHours } from "@/types/agency";
import { seedDefaultServices } from "@/lib/actions/services/seed-services";

type CreateAgencyInput = {
  name: string;
  email: string;
  phone: string;
  website: string;
  description: string;
};

export async function createAgencyProfile(input: CreateAgencyInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  // Check if an agency already exists for this user (to prevent duplicates if the second step failed previously)
  const { data: existingAgency } = await supabase
    .from("agencies")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  let agency = existingAgency;
  let agencyError = null;

  if (!agency) {
    // Generate a simple slug from the name
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

    // 1. Create the agency record
    const { data: newAgency, error: newAgencyError } = await supabase
      .from("agencies")
      .insert({
        owner_id: user.id,
        name: input.name,
        slug,
        email: input.email,
        phone: input.phone,
        website: input.website,
        description: input.description,
        is_onboarding_completed: false,
      })
      .select()
      .single();
      
    agency = newAgency;
    agencyError = newAgencyError;
  }

  if (agencyError || !agency) {
    console.error("Error creating agency:", agencyError);
    return { error: `Failed to create agency profile. Details: ${agencyError?.message || "Unknown error"}` };
  }

  // 2. Fetch the OWNER role ID
  const { data: ownerRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "OWNER")
    .single();

  if (!ownerRole) {
    return { error: "System error: OWNER role not found." };
  }

  // 3. Create the agency_user relationship if it doesn't exist
  const { data: existingAgencyUser } = await supabase
    .from("agency_users")
    .select("id")
    .eq("agency_id", agency.id)
    .eq("auth_user_id", user.id)
    .single();

  if (!existingAgencyUser) {
    const { error: agencyUserError } = await supabase
      .from("agency_users")
      .insert({
        agency_id: agency.id,
        auth_user_id: user.id,
        role_id: ownerRole.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        phone: input.phone,
      });

    if (agencyUserError) {
      console.error("Error linking user to agency:", agencyUserError);
      return { error: `Failed to link your user account to the new agency. Details: ${agencyUserError?.message || "Unknown error"}` };
    }
  }

  // 4. Seed default services for the newly created agency
  if (!existingAgency) {
    const seedResult = await seedDefaultServices(agency.id);
    if (!seedResult.success) {
      console.warn("Failed to seed default services, but agency was created:", seedResult.error);
    }
  }

  return { data: agency };
}

export async function updateAgencyProfile(agencyId: string, updates: Partial<Agency>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Only allow updating the specified fields
  const allowedUpdates = [
    "name", "email", "phone", "website", "description", 
    "address_line_1", "address_line_2", "city", "state", 
    "postal_code", "country", "latitude", "longitude", 
    "timezone", "business_hours", "theme_color", "logo_url"
  ];
  
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
  );

  const { error } = await supabase
    .from("agencies")
    .update(filteredUpdates)
    .eq("id", agencyId);

  if (error) {
    console.error("Error updating agency:", error);
    return { error: "Failed to update agency profile." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding(agencyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("agencies")
    .update({ is_onboarding_completed: true })
    .eq("id", agencyId);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: "Failed to complete onboarding." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
