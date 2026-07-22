import { createAdminClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';
import { rankResults } from './ranking';

export interface RetrievalResult {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  source: string;
}

export async function retrieveKnowledge(query: string, agencyId: string): Promise<RetrievalResult[]> {
  const supabase = createAdminClient();

  // 1. Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Perform hybrid search (semantic + keyword)
  // For now, we'll rely on pgvector for semantic search.
  // In a full production system, we might combine this with full-text search.
  
  // To do a raw RPC call to a match_knowledge function if it exists:
  const { data: vectorResults, error } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
    p_agency_id: agencyId
  });

  // Since we might not have `match_knowledge` RPC created in our migration yet,
  // we'll implement a fallback JS-level filtering if RPC fails or isn't there,
  // but ideally we should add the RPC to the migration.
  
  let rawResults = vectorResults;
  
  // If vector search fails (e.g. OpenAI quota exceeded) or returns 0 results, fallback to keyword search
  if (error || !vectorResults || vectorResults.length === 0) {
    if (error) console.warn('RPC match_knowledge failed', error);
    
    // Extract keywords (longer than 3 chars) to use in fallback search
    const keywords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    let fallbackQuery = supabase
      .from('knowledge_entries')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('status', 'ACTIVE')
      .eq('is_ai_enabled', true);

    // If we have keywords, do an OR search across the search_text
    if (keywords.length > 0) {
      const orConditions = keywords.map(kw => `search_text.ilike.%${kw}%`).join(',');
      fallbackQuery = fallbackQuery.or(orConditions);
    }
    
    const { data: fallbackData } = await fallbackQuery.limit(10);
      
    rawResults = (fallbackData || []).map(entry => ({
      ...entry,
      similarity: 0.5 // mock similarity for fallback
    }));
  }

  // 3. Rank results
  const ranked = rankResults(rawResults || [], query);

  return ranked.map((r: any) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    confidence: r.similarity || r.confidence_score || 0.8,
    source: r.source_type || 'KNOWLEDGE_BASE',
  }));
}
