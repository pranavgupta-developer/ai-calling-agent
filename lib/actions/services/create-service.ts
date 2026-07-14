"use server";

import { ServiceManager } from "@/lib/services/service-manager";
import { createClient } from "@/lib/supabase/server";
import { createServiceSchema, CreateServiceValues } from "@/lib/validations/service";
import { revalidatePath } from "next/cache";

export async function createService(values: CreateServiceValues) {
  try {
    const validatedFields = createServiceSchema.parse(values);
    
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

    // Creating from scratch is always a custom service
    const serviceData = {
      ...validatedFields,
      category: validatedFields.category ?? null,
      template_id: validatedFields.template_id ?? null,
    };
    const newService = await ServiceManager.createCustomService(agencyId, serviceData as any);

    revalidatePath("/dashboard/services");
    return { success: true, data: newService };
  } catch (error: any) {
    console.error("Create service error:", error);
    return { error: error.message || "Failed to create service" };
  }
}
