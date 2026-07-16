"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { 
  CreateAIAgentSchema, 
  UpdateAIAgentSchema, 
  AssignListingSchema, 
  AssignServiceSchema 
} from "@/lib/validators/ai-agent";
import { checkAgentLimit } from "@/lib/services/plan-limits";
import { AIAgent } from "@/types/ai-agent";

import { SupabaseClient } from "@supabase/supabase-js";

async function getAgencyId(supabase: SupabaseClient, userId: string) {
  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", userId)
    .single();
    
  if (agency) return agency.id;
  
  const { data: agencyUser } = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("auth_user_id", userId)
    .single();
    
  return agencyUser?.agency_id || null;
}

export async function getAgents(filters?: { search?: string, is_active?: boolean, provider?: string, language?: string, sort?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  let query = supabase.from("ai_agents").select("*").is("deleted_at", null);

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,system_prompt.ilike.%${filters.search}%`);
  }
  
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  if (filters?.provider) {
    query = query.eq("provider", filters.provider);
  }

  if (filters?.language) {
    query = query.eq("language", filters.language);
  }

  switch (filters?.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "alphabetical":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching agents:", error.message || error);
    return { error: `Failed to fetch agents: ${error.message || "Unknown error"}` };
  }

  return { data: data as AIAgent[] };
}

export async function getAgent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching agent:", error);
    return { error: "Failed to fetch agent." };
  }

  // Fetch assigned listings and services
  const { data: listings } = await supabase.from("agent_listings").select("listing_id").eq("agent_id", id);
  const { data: services } = await supabase.from("agent_services").select("service_id").eq("agent_id", id);

  return { 
    data: {
      ...data,
      assigned_listings: listings?.map(l => l.listing_id) || [],
      assigned_services: services?.map(s => s.service_id) || [],
    } 
  };
}

export async function createAgent(input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  // Plan limit check
  const limitCheck = await checkAgentLimit(agencyId);
  if (!limitCheck.allowed) {
    if (limitCheck.error) {
      return { error: `Error checking plan limits: ${limitCheck.error}` };
    }
    return { error: `Plan limit reached. You can only create up to ${limitCheck.limit} agents on your current plan.` };
  }

  const parsedInput = CreateAIAgentSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: "Invalid data", details: parsedInput.error.format() };
  }

  const { error, data } = await supabase.from("ai_agents").insert({
    ...parsedInput.data,
    agency_id: agencyId,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single();

  if (error) {
    console.error("Error creating agent:", error);
    return { error: "Failed to create AI agent." };
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true, data: { id: data.id } };
}

export async function updateAgent(id: string, input: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const parsedInput = UpdateAIAgentSchema.safeParse({ ...input, id });
  if (!parsedInput.success) {
    return { error: "Invalid data", details: parsedInput.error.format() };
  }

  const { id: _ignore, ...updateData } = parsedInput.data;

  const { error } = await supabase
    .from("ai_agents")
    .update({
      ...updateData,
      updated_by: user.id,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    console.error("Error updating agent:", error);
    return { error: "Failed to update AI agent." };
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function softDeleteAgent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("ai_agents")
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    console.error("Error deleting agent:", error);
    return { error: "Failed to delete AI agent." };
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function toggleAgent(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("ai_agents")
    .update({
      is_active: !currentStatus,
      updated_by: user.id,
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    console.error("Error toggling agent status:", error);
    return { error: "Failed to update agent status." };
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function assignListings(agentId: string, listingIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  // First delete existing assignments for this agent
  const { error: deleteError } = await supabase
    .from("agent_listings")
    .delete()
    .eq("agent_id", agentId);

  if (deleteError) {
    console.error("Error deleting existing agent listings:", deleteError);
    return { error: "Failed to update assignments." };
  }

  if (listingIds.length > 0) {
    // Validate inputs
    for (const listingId of listingIds) {
      const parsed = AssignListingSchema.safeParse({ agent_id: agentId, listing_id: listingId });
      if (!parsed.success) return { error: "Invalid ID provided." };
    }

    // Security check: ensure these listings belong to the agency
    const { data: validListings } = await supabase
      .from("properties")
      .select("id")
      .in("id", listingIds)
      .eq("agency_id", agencyId);
      
    if (!validListings || validListings.length !== listingIds.length) {
      return { error: "Some listings do not belong to your agency." };
    }

    const inserts = listingIds.map(listingId => ({
      agent_id: agentId,
      listing_id: listingId,
      agency_id: agencyId
    }));

    const { error: insertError } = await supabase.from("agent_listings").insert(inserts);

    if (insertError) {
      console.error("Error assigning agent listings:", insertError);
      return { error: "Failed to insert new assignments." };
    }
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function assignServices(agentId: string, serviceIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  // First delete existing assignments for this agent
  const { error: deleteError } = await supabase
    .from("agent_services")
    .delete()
    .eq("agent_id", agentId);

  if (deleteError) {
    console.error("Error deleting existing agent services:", deleteError);
    return { error: "Failed to update assignments." };
  }

  if (serviceIds.length > 0) {
    // Validate inputs
    for (const serviceId of serviceIds) {
      const parsed = AssignServiceSchema.safeParse({ agent_id: agentId, service_id: serviceId });
      if (!parsed.success) return { error: "Invalid ID provided." };
    }

    // Security check: ensure these services belong to the agency
    const { data: validServices } = await supabase
      .from("services")
      .select("id")
      .in("id", serviceIds)
      .eq("agency_id", agencyId);
      
    if (!validServices || validServices.length !== serviceIds.length) {
      return { error: "Some services do not belong to your agency." };
    }

    const inserts = serviceIds.map(serviceId => ({
      agent_id: agentId,
      service_id: serviceId,
      agency_id: agencyId
    }));

    const { error: insertError } = await supabase.from("agent_services").insert(inserts);

    if (insertError) {
      console.error("Error assigning agent services:", insertError);
      return { error: "Failed to insert new assignments." };
    }
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function duplicateAgent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  // Plan limit check
  const limitCheck = await checkAgentLimit(agencyId);
  if (!limitCheck.allowed) {
    if (limitCheck.error) {
      return { error: `Error checking plan limits: ${limitCheck.error}` };
    }
    return { error: `Plan limit reached. You can only create up to ${limitCheck.limit} agents on your current plan.` };
  }

  // Fetch source agent
  const { data: agent, error: agentError } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (agentError || !agent) {
    return { error: "Source agent not found." };
  }

  // Fetch assignments
  const { data: listings } = await supabase.from("agent_listings").select("listing_id").eq("agent_id", id);
  const { data: services } = await supabase.from("agent_services").select("service_id").eq("agent_id", id);

  const { id: _oldId, created_at, updated_at, created_by, updated_by, deleted_at, name, is_active, ...rest } = agent;

  // Insert duplicated agent
  const { data: newAgent, error: insertError } = await supabase.from("ai_agents").insert({
    ...rest,
    name: `${name} (Copy)`,
    is_active: false,
    agency_id: agencyId,
    created_by: user.id,
    updated_by: user.id,
  }).select("id").single();

  if (insertError || !newAgent) {
    console.error("Error duplicating agent:", insertError);
    return { error: "Failed to duplicate AI agent." };
  }

  // Duplicate listings
  if (listings && listings.length > 0) {
    const listingInserts = listings.map(l => ({
      agent_id: newAgent.id,
      listing_id: l.listing_id,
      agency_id: agencyId
    }));
    await supabase.from("agent_listings").insert(listingInserts);
  }

  // Duplicate services
  if (services && services.length > 0) {
    const serviceInserts = services.map(s => ({
      agent_id: newAgent.id,
      service_id: s.service_id,
      agency_id: agencyId
    }));
    await supabase.from("agent_services").insert(serviceInserts);
  }

  revalidatePath("/dashboard/ai-agents");
  return { success: true };
}

export async function getAgentConfiguration(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: agent, error } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !agent) {
    console.error("Error fetching agent configuration:", error);
    return { error: "Agent not found." };
  }

  const { data: listings } = await supabase.from("agent_listings").select("listing_id").eq("agent_id", id);
  const { data: services } = await supabase.from("agent_services").select("service_id").eq("agent_id", id);

  return { 
    data: {
      id: agent.id,
      agency_id: agent.agency_id,
      name: agent.name,
      description: agent.description,
      system_prompt: agent.system_prompt,
      greeting: agent.greeting,
      personality: agent.personality,
      language: agent.language,
      voice: agent.voice,
      provider: agent.provider,
      
      runtime_settings: {
        model: agent.model,
        temperature: agent.temperature,
        max_tokens: agent.max_tokens,
        fallback_mode: agent.fallback_mode,
        response_style: agent.response_style,
      },
      
      tool_permissions: agent.tool_permissions || {},
      
      assigned_listings: listings?.map(l => l.listing_id) || [],
      assigned_services: services?.map(s => s.service_id) || [],
    } 
  };
}

export async function getStatistics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  // Fetch all agents for agency
  const { data: agents, error } = await supabase
    .from("ai_agents")
    .select("id, is_active, updated_at")
    .eq("agency_id", agencyId)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching statistics:", error);
    return { error: "Failed to load statistics." };
  }

  const total = agents.length;
  const active = agents.filter(a => a.is_active).length;
  const inactive = total - active;
  
  // Sort to find latest update
  let lastUpdated = null;
  if (agents.length > 0) {
    lastUpdated = agents.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0].updated_at;
  }

  // Fetch counts for average listings/services
  const { count: listingsCount } = await supabase
    .from("agent_listings")
    .select("id", { count: 'exact', head: true })
    .eq("agency_id", agencyId);
    
  const { count: servicesCount } = await supabase
    .from("agent_services")
    .select("id", { count: 'exact', head: true })
    .eq("agency_id", agencyId);

  const avgListings = total > 0 ? ((listingsCount || 0) / total).toFixed(1) : "0";
  const avgServices = total > 0 ? ((servicesCount || 0) / total).toFixed(1) : "0";

  return {
    data: {
      total,
      active,
      inactive,
      avgListings,
      avgServices,
      lastUpdated
    }
  };
}
