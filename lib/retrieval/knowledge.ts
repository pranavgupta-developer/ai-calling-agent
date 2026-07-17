import { SupabaseClient } from '@supabase/supabase-js';
import { RankedKnowledge } from './types';
import { rankKnowledge } from './ranking';

export async function searchKnowledge(
  supabase: SupabaseClient,
  query: string,
  agencyId: string,
  limit: number = 10
): Promise<RankedKnowledge[]> {
  // Try full text search first
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, question, answer, category, tags, priority')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .textSearch('fts', query, {
      type: 'websearch',
      config: 'english'
    })
    .limit(limit * 3); // fetch more for client-side ranking

  if (error) {
    console.error('Error in searchKnowledge (FTS):', error);
    // Do not throw; allow it to gracefully fallback to ilike search below
  }

  let results = data || [];

  // If very few results, fallback to a basic ilike search
  if (results.length < limit / 2) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('knowledge_base')
      .select('id, question, answer, category, tags, priority')
      .eq('agency_id', agencyId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .or(`question.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit * 2);

    if (fallbackError) {
      console.error('Error in searchKnowledge (Fallback):', fallbackError);
    } else if (fallbackData) {
      // Merge results avoiding duplicates
      const existingIds = new Set(results.map(r => r.id));
      const newItems = fallbackData.filter(r => !existingIds.has(r.id));
      results = [...results, ...newItems];
    }
  }

  // Rank and limit
  return rankKnowledge(results, query).slice(0, limit);
}
