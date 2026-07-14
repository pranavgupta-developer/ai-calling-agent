"use server";

import { createClient } from "@/lib/supabase/server";
import { ServiceTemplate } from "@/types/service";

export type SeedServicesResult = {
  success: boolean;
  insertedCount: number;
  error?: string;
};

/**
 * Seeds the default service templates for a specific agency.
 * Includes duplicate protection to prevent inserting templates if the agency already has them.
 * 
 * @param agencyId The UUID of the agency to seed services for.
 * @returns An object containing success status, inserted count, and any error message.
 */
export async function seedDefaultServices(agencyId: string): Promise<SeedServicesResult> {
  try {
    const supabase = await createClient();

    // 1. Verify agency exists
    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .select("id")
      .eq("id", agencyId)
      .single();

    if (agencyError || !agency) {
      console.error(`[seedDefaultServices] Agency not found or error: ${agencyId}`, agencyError);
      return { success: false, insertedCount: 0, error: "Agency not found or database error" };
    }

    // 2. Check for duplicate protection
    // We check if the agency already has ANY templates seeded.
    const { count, error: countError } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("is_template", true);

    if (countError) {
      console.error(`[seedDefaultServices] Error checking existing services for agency: ${agencyId}`, countError);
      return { success: false, insertedCount: 0, error: "Failed to check existing services" };
    }

    if (count && count > 0) {
      // Agency already has templates, skip seeding
      console.log(`[seedDefaultServices] Agency ${agencyId} already has ${count} template(s). Skipping seed.`);
      return { success: true, insertedCount: 0 };
    }

    // 3. Fetch all active master templates
    const { data: templates, error: templatesError } = await supabase
      .from("service_templates")
      .select("*")
      .eq("active", true);

    if (templatesError) {
      console.error(`[seedDefaultServices] Error fetching service templates`, templatesError);
      return { success: false, insertedCount: 0, error: "Failed to fetch service templates" };
    }

    if (!templates || templates.length === 0) {
      console.log(`[seedDefaultServices] No active service templates found in the database.`);
      return { success: true, insertedCount: 0 };
    }

    // 4. Map templates to agency services
    const servicesToInsert = (templates as ServiceTemplate[]).map((template) => ({
      agency_id: agencyId,
      name: template.name,
      description: template.description,
      category: template.category,
      pricing_type: template.pricing_type,
      fixed_price: template.fixed_price,
      min_price: template.min_price,
      max_price: template.max_price,
      currency: template.currency,
      duration_minutes: template.duration_minutes,
      active: true,
      is_template: true, // Marked as template so we know it came from the default set
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // 5. Bulk insert mapped services
    const { error: insertError } = await supabase
      .from("services")
      .insert(servicesToInsert);

    if (insertError) {
      console.error(`[seedDefaultServices] Error bulk inserting services for agency: ${agencyId}`, insertError);
      return { success: false, insertedCount: 0, error: "Failed to insert services" };
    }

    console.log(`[seedDefaultServices] Successfully seeded ${servicesToInsert.length} services for agency: ${agencyId}`);
    return { success: true, insertedCount: servicesToInsert.length };

  } catch (err) {
    console.error(`[seedDefaultServices] Unexpected error seeding services for agency: ${agencyId}`, err);
    return { success: false, insertedCount: 0, error: "Unexpected internal error" };
  }
}
