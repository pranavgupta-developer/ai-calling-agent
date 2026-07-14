import { createClient } from "@/lib/supabase/server";
import { Service, ServiceTemplate, MergedService, CreateServiceInput, UpdateServiceInput } from "@/types/service";

export class ServiceManager {
  /**
   * Private helper to get an authenticated Supabase client
   */
  private static async getClient() {
    return await createClient();
  }

  /**
   * The core merge algorithm. 
   * Loads global templates and agency services, combining them into MergedService[].
   */
  static async getMergedServices(agencyId: string): Promise<MergedService[]> {
    const supabase = await this.getClient();

    // 1. Fetch active templates
    const { data: templatesData, error: templatesError } = await supabase
      .from("service_templates")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (templatesError) throw new Error(templatesError.message);
    const templates = (templatesData || []) as ServiceTemplate[];

    // 2. Fetch agency services (both overrides and custom services)
    const { data: agencyServicesData, error: agencyServicesError } = await supabase
      .from("services")
      .select("*")
      .eq("agency_id", agencyId)
      .is("deleted_at", null);

    if (agencyServicesError) throw new Error(agencyServicesError.message);
    const agencyServices = (agencyServicesData || []) as Service[];

    // 3. Map agency services for quick lookup
    const overridesMap = new Map<string, Service>();
    const customServices: MergedService[] = [];

    for (const service of agencyServices) {
      if (service.template_id) {
        overridesMap.set(service.template_id, service);
      } else {
        customServices.push({
          ...service,
          templateId: null,
          agencyId: service.agency_id,
          source: 'CUSTOM',
          editable: true,
          deletable: true,
          isCustom: true
        });
      }
    }

    // 4. Merge templates with overrides
    const mergedTemplates: MergedService[] = templates.map(template => {
      const override = overridesMap.get(template.id);
      
      if (override) {
        // Return override-dominated object
        return {
          id: override.id, // Using the override's ID for updates
          templateId: template.id,
          agencyId: agencyId,
          name: override.name,
          description: override.description,
          category: override.category,
          pricing_type: override.pricing_type,
          fixed_price: override.fixed_price,
          min_price: override.min_price,
          max_price: override.max_price,
          currency: override.currency,
          duration_minutes: override.duration_minutes,
          active: override.active,
          source: 'OVERRIDE',
          editable: true,
          deletable: true, // Deleting an override restores the template
          isCustom: false,
          created_at: override.created_at,
          updated_at: override.updated_at
        };
      }

      // Return default template object
      return {
        id: template.id,
        templateId: template.id,
        agencyId: agencyId,
        name: template.name,
        description: template.description,
        category: template.category,
        pricing_type: template.pricing_type,
        fixed_price: template.fixed_price,
        min_price: template.min_price,
        max_price: template.max_price,
        currency: template.currency,
        duration_minutes: template.duration_minutes,
        active: template.active,
        source: 'DEFAULT',
        editable: true, // Edits to DEFAULT will spawn an OVERRIDE
        deletable: false, // Default templates cannot be deleted
        isCustom: false,
        created_at: template.created_at,
        updated_at: template.updated_at
      };
    });

    // 5. Return unified list
    return [...mergedTemplates, ...customServices];
  }

  /**
   * AI specifically needs cleaner, smaller data without UI-specific flags.
   */
  static async getServicesForAI(agencyId: string) {
    const merged = await this.getMergedServices(agencyId);
    return merged
      .filter(s => s.active)
      .map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        pricing_type: s.pricing_type,
        fixed_price: s.fixed_price,
        min_price: s.min_price,
        max_price: s.max_price,
        currency: s.currency,
        duration_minutes: s.duration_minutes
      }));
  }

  static async getTemplates(): Promise<ServiceTemplate[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("service_templates")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });
    
    if (error) throw new Error(error.message);
    return data as ServiceTemplate[];
  }

  static async getTemplate(slug: string): Promise<ServiceTemplate | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("service_templates")
      .select("*")
      .eq("slug", slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data as ServiceTemplate | null;
  }

  static async createOverride(agencyId: string, templateId: string, data: UpdateServiceInput): Promise<Service> {
    const supabase = await this.getClient();
    
    // First, verify the template exists
    const { data: template, error: templateError } = await supabase
      .from("service_templates")
      .select("*")
      .eq("id", templateId)
      .single();
      
    if (templateError || !template) throw new Error("Template not found");

    // Get current user id
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    // Merge template data with override data to ensure required fields exist
    const insertData = {
      agency_id: agencyId,
      template_id: templateId,
      name: data.name ?? template.name,
      description: data.description ?? template.description,
      category: data.category ?? template.category,
      pricing_type: data.pricing_type ?? template.pricing_type,
      fixed_price: data.fixed_price ?? template.fixed_price,
      min_price: data.min_price ?? template.min_price,
      max_price: data.max_price ?? template.max_price,
      currency: data.currency ?? template.currency,
      duration_minutes: data.duration_minutes ?? template.duration_minutes,
      active: data.active ?? template.active,
      is_custom: false,
      created_by: userId,
      updated_by: userId
    };

    const { data: newService, error } = await supabase
      .from("services")
      .insert(insertData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newService as Service;
  }

  static async updateOverride(agencyId: string, overrideId: string, data: UpdateServiceInput): Promise<Service> {
    const supabase = await this.getClient();
    const { data: authData } = await supabase.auth.getUser();

    const { data: updatedService, error } = await supabase
      .from("services")
      .update({
        ...data,
        updated_by: authData.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", overrideId)
      .eq("agency_id", agencyId)
      .not("template_id", "is", null)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedService as Service;
  }

  static async removeOverride(agencyId: string, overrideId: string): Promise<void> {
    const supabase = await this.getClient();
    // Hard delete for overrides
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", overrideId)
      .eq("agency_id", agencyId)
      .not("template_id", "is", null);

    if (error) throw new Error(error.message);
  }

  static async restoreTemplate(agencyId: string, overrideId: string): Promise<void> {
    return this.removeOverride(agencyId, overrideId);
  }

  static async createCustomService(agencyId: string, data: CreateServiceInput): Promise<Service> {
    const supabase = await this.getClient();
    const { data: authData } = await supabase.auth.getUser();

    const { data: newService, error } = await supabase
      .from("services")
      .insert({
        ...data,
        agency_id: agencyId,
        template_id: null,
        is_custom: true,
        created_by: authData.user?.id,
        updated_by: authData.user?.id
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newService as Service;
  }

  static async updateCustomService(agencyId: string, id: string, data: UpdateServiceInput): Promise<Service> {
    const supabase = await this.getClient();
    const { data: authData } = await supabase.auth.getUser();

    const { data: updatedService, error } = await supabase
      .from("services")
      .update({
        ...data,
        updated_by: authData.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("agency_id", agencyId)
      .is("template_id", null)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedService as Service;
  }

  static async deleteCustomService(agencyId: string, id: string): Promise<void> {
    const supabase = await this.getClient();
    const { data: authData } = await supabase.auth.getUser();

    // Soft delete for custom services
    const { error } = await supabase
      .from("services")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: authData.user?.id,
        active: false
      })
      .eq("id", id)
      .eq("agency_id", agencyId)
      .is("template_id", null);

    if (error) throw new Error(error.message);
  }

  static async archiveService(agencyId: string, id: string): Promise<void> {
    // Archiving is turning active to false
    await this.toggleService(agencyId, id, false);
  }

  static async toggleService(agencyId: string, id: string, forceActive?: boolean): Promise<Service> {
    const supabase = await this.getClient();
    
    // Check if it's an override or custom
    const { data: existing, error: checkError } = await supabase
      .from("services")
      .select("active")
      .eq("id", id)
      .eq("agency_id", agencyId)
      .single();
      
    if (checkError) throw new Error(checkError.message);

    const newStatus = forceActive !== undefined ? forceActive : !existing.active;

    const { data: authData } = await supabase.auth.getUser();

    const { data: updatedService, error } = await supabase
      .from("services")
      .update({
        active: newStatus,
        updated_by: authData.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("agency_id", agencyId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedService as Service;
  }
}
