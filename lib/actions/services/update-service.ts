"use server";

import { ServiceManager } from "@/lib/services/service-manager";
import { createClient } from "@/lib/supabase/server";
import { updateServiceSchema, UpdateServiceValues } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function updateService(
  id: string, 
  values: UpdateServiceValues, 
  source: 'DEFAULT' | 'OVERRIDE' | 'CUSTOM',
  templateId: string | null
) {
  try {
    const validatedFields = updateServiceSchema.parse(values);
    
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return { error: "Unauthorized" };
    }

    const userId = authData.user.id;
    let { data: agencies } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", userId)
      .single();

    let agencyId = agencies?.id;

    if (!agencyId) {
      let { data: agencyUser } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("auth_user_id", userId)
        .single();
      agencyId = agencyUser?.agency_id;
    }

    if (!agencyId) {
      return { error: "Agency not found" };
    }

    const serviceData = {
      ...validatedFields,
      category: validatedFields.category ?? null,
      template_id: validatedFields.template_id ?? null,
    };

    let updatedService;
    if (source === 'DEFAULT') {
      if (!templateId) throw new Error("Template ID is required to create an override");
      updatedService = await ServiceManager.createOverride(agencyId, templateId, serviceData as any);
    } else if (source === 'OVERRIDE') {
      updatedService = await ServiceManager.updateOverride(agencyId, id, serviceData as any);
    } else {
      updatedService = await ServiceManager.updateCustomService(agencyId, id, serviceData as any);
    }

    revalidatePath("/dashboard/services");
    return { success: true, data: updatedService };
  } catch (error: any) {
    console.error("Update service error:", error);
    return { error: error.message || "Failed to update service" };
  }
}
