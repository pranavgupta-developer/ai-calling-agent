"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { 
  KnowledgeBaseFormData, 
  knowledgeBaseSchema, 
  SearchKnowledgeBaseQuery, 
  searchKnowledgeBaseSchema 
} from "@/lib/validations/knowledge-base";
import { KnowledgeBaseStats } from "@/types/knowledge-base";

async function getAgencyId(supabase: any, userId: string) {
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

export async function getKnowledgeEntries(query: SearchKnowledgeBaseQuery) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const parsedParams = searchKnowledgeBaseSchema.safeParse(query);
  if (!parsedParams.success) {
    return { error: "Invalid search parameters" };
  }

  const { q, page, limit, category, status, source, sort } = parsedParams.data;
  
  let dbQuery = supabase
    .from("knowledge_base")
    .select("*", { count: "exact" })
    .eq("is_deleted", false);

  if (q) {
    // Basic ilike search across multiple fields
    dbQuery = dbQuery.or(`question.ilike.%${q}%,answer.ilike.%${q}%,category.ilike.%${q}%,search_text.ilike.%${q}%`);
  }

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  if (status !== "all") {
    dbQuery = dbQuery.eq("is_active", status === "active");
  }

  if (source !== "all") {
    dbQuery = dbQuery.eq("source", source);
  }

  switch (sort) {
    case "newest":
      dbQuery = dbQuery.order("created_at", { ascending: false });
      break;
    case "oldest":
      dbQuery = dbQuery.order("created_at", { ascending: true });
      break;
    case "highest_priority":
      dbQuery = dbQuery.order("priority", { ascending: false });
      break;
    case "lowest_priority":
      dbQuery = dbQuery.order("priority", { ascending: true });
      break;
    default:
      dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  dbQuery = dbQuery.range(from, to);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching knowledge entries:", error);
    return { error: "Failed to fetch knowledge base entries." };
  }

  return {
    data,
    count: count || 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function createKnowledgeEntry(input: KnowledgeBaseFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const agencyId = await getAgencyId(supabase, user.id);
  if (!agencyId) return { error: "Agency not found" };

  const parsedInput = knowledgeBaseSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: "Invalid data", details: parsedInput.error.format() };
  }

  const { error } = await supabase.from("knowledge_base").insert({
    ...parsedInput.data,
    agency_id: agencyId,
    created_by: user.id,
    updated_by: user.id,
    source: "custom"
  });

  if (error) {
    console.error("Error creating knowledge entry:", error);
    return { error: "Failed to create knowledge entry." };
  }

  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function updateKnowledgeEntry(id: string, input: KnowledgeBaseFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const parsedInput = knowledgeBaseSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: "Invalid data", details: parsedInput.error.format() };
  }

  // Ensure id is not overwritten
  const { id: _ignore, ...updateData } = parsedInput.data;

  const { error } = await supabase
    .from("knowledge_base")
    .update({
      ...updateData,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    console.error("Error updating knowledge entry:", error);
    return { error: "Failed to update knowledge entry." };
  }

  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function softDeleteKnowledgeEntry(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("knowledge_base")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error deleting knowledge entry:", error);
    return { error: "Failed to delete knowledge entry." };
  }

  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function toggleKnowledgeStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("knowledge_base")
    .update({
      is_active: !currentStatus,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("is_deleted", false);

  if (error) {
    console.error("Error toggling knowledge status:", error);
    return { error: "Failed to update status." };
  }

  revalidatePath("/dashboard/knowledge-base");
  return { success: true };
}

export async function getKnowledgeStats(): Promise<{ data?: KnowledgeBaseStats, error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch all non-deleted for this user's agency (RLS applies)
  // Instead of multiple count queries which might be slow, we can do one single select and count in memory if it's small,
  // but for scalability, let's run individual count queries or a single RPC. Since we don't have RPC, let's just do individual.
  
  const [totalRes, activeRes, customRes, seedRes, categoriesRes, recentRes] = await Promise.all([
    supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("is_deleted", false).eq("is_active", true),
    supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("is_deleted", false).eq("source", "custom"),
    supabase.from("knowledge_base").select("*", { count: "exact", head: true }).eq("is_deleted", false).eq("source", "system"), // Assuming 'system' is seed
    supabase.from("knowledge_base").select("category").eq("is_deleted", false), // fetch categories for uniqueness
    supabase.from("knowledge_base").select("*").eq("is_deleted", false).order("updated_at", { ascending: false }).limit(5)
  ]);

  if (totalRes.error) {
    console.error("Error fetching stats:", totalRes.error);
    return { error: "Failed to fetch stats." };
  }

  const uniqueCategories = new Set(categoriesRes.data?.map(c => c.category) || []).size;

  return {
    data: {
      total: totalRes.count || 0,
      active: activeRes.count || 0,
      inactive: (totalRes.count || 0) - (activeRes.count || 0),
      custom: customRes.count || 0,
      seed: seedRes.count || 0,
      uniqueCategories,
      recentlyUpdated: recentRes.data || [],
    }
  };
}
