import { createClient } from "@/lib/supabase/server";
import { 
  CreateKnowledgeBaseInput, 
  UpdateKnowledgeBaseInput, 
  SearchKnowledgeBaseQuery,
  KnowledgeBaseSource
} from "@/lib/validations/knowledge-base";

export interface KnowledgeBaseEntry {
  id: string;
  agency_id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  search_keywords: string | null;
  source: KnowledgeBaseSource;
  display_order: number;
  is_active: boolean;
  is_system: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export class KnowledgeBaseService {
  private static async getClient() {
    return await createClient();
  }

  /**
   * Retrieves a single active knowledge base entry by ID.
   */
  static async getById(agencyId: string, id: string): Promise<KnowledgeBaseEntry | null> {
    const supabase = await this.getClient();
    
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("agency_id", agencyId)
      .eq("id", id)
      .is("deleted_at", null)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data as KnowledgeBaseEntry | null;
  }

  /**
   * Searches and lists knowledge base entries with pagination and filters.
   */
  static async search(agencyId: string, query: SearchKnowledgeBaseQuery) {
    const supabase = await this.getClient();
    
    let dbQuery = supabase
      .from("knowledge_base")
      .select("*", { count: "exact" })
      .eq("agency_id", agencyId)
      .is("deleted_at", null);
      
    // Keyword search
    if (query.q) {
      // Basic text search using ILIKE on question, tags, search_keywords
      const searchPattern = `%${query.q}%`;
      dbQuery = dbQuery.or(`question.ilike.${searchPattern},search_keywords.ilike.${searchPattern}`);
    }
    
    // Category filter
    if (query.category) {
      dbQuery = dbQuery.eq("category", query.category);
    }
    
    // Status filter
    if (query.status === "active") {
      dbQuery = dbQuery.eq("is_active", true);
    } else if (query.status === "inactive") {
      dbQuery = dbQuery.eq("is_active", false);
    }
    
    // Sorting
    if (query.sort === "newest") {
      dbQuery = dbQuery.order("created_at", { ascending: false });
    } else if (query.sort === "oldest") {
      dbQuery = dbQuery.order("created_at", { ascending: true });
    } else {
      // default: display_order
      dbQuery = dbQuery.order("display_order", { ascending: true }).order("created_at", { ascending: false });
    }
    
    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    dbQuery = dbQuery.range(from, to);
    
    const { data, error, count } = await dbQuery;
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return {
      data: data as KnowledgeBaseEntry[],
      count: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  }

  /**
   * Creates a new knowledge base entry.
   */
  static async create(agencyId: string, input: CreateKnowledgeBaseInput): Promise<KnowledgeBaseEntry> {
    const supabase = await this.getClient();
    
    const insertData = {
      agency_id: agencyId,
      question: input.question,
      answer: input.answer,
      category: input.category,
      tags: input.tags,
      search_keywords: null,
      source: "custom" as KnowledgeBaseSource,
      display_order: input.priority || 0,
      is_active: input.is_active,
      is_system: false
    };
    
    const { data, error } = await supabase
      .from("knowledge_base")
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to create knowledge base entry: ${error.message}`);
    }
    
    return data as KnowledgeBaseEntry;
  }

  /**
   * Updates an existing knowledge base entry.
   */
  static async update(agencyId: string, id: string, input: UpdateKnowledgeBaseInput): Promise<KnowledgeBaseEntry> {
    const supabase = await this.getClient();
    
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (input.question !== undefined) updateData.question = input.question;
    if (input.answer !== undefined) updateData.answer = input.answer;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.priority !== undefined) updateData.display_order = input.priority;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    
    const { data, error } = await supabase
      .from("knowledge_base")
      .update(updateData)
      .eq("agency_id", agencyId)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Failed to update knowledge base entry: ${error.message}`);
    }
    
    return data as KnowledgeBaseEntry;
  }

  /**
   * Soft deletes a knowledge base entry.
   */
  static async softDelete(agencyId: string, id: string): Promise<void> {
    const supabase = await this.getClient();
    
    const { error } = await supabase
      .from("knowledge_base")
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq("agency_id", agencyId)
      .eq("id", id)
      .is("deleted_at", null);
      
    if (error) {
      throw new Error(`Failed to delete knowledge base entry: ${error.message}`);
    }
  }
}
