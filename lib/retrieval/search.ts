import { SupabaseClient } from '@supabase/supabase-js';
import { searchKnowledge } from './knowledge';
import { searchListings } from './listings';
import { SearchQuery, SearchResponse } from './types';

export async function search(
  supabase: SupabaseClient,
  params: SearchQuery
): Promise<SearchResponse> {
  const startTime = Date.now();
  const limit = params.limit || 10;
  
  if (!params.query || params.query.trim() === '') {
    return {
      knowledge: [],
      listings: [],
      metadata: {
        searchTimeMs: 0,
        knowledgeCount: 0,
        listingCount: 0
      }
    };
  }

  try {
    // Run both searches in parallel
    const [knowledgeResults, listingsResults] = await Promise.all([
      searchKnowledge(supabase, params.query, params.agencyId, limit),
      searchListings(supabase, params.query, params.agencyId, limit)
    ]);

    const searchTimeMs = Date.now() - startTime;
    const knowledgeCount = knowledgeResults.length;
    const listingCount = listingsResults.length;
    const totalResults = knowledgeCount + listingCount;

    // Fire and forget logging
    supabase.from('search_logs').insert({
      agency_id: params.agencyId,
      query: params.query,
      results_found: totalResults,
      search_time_ms: searchTimeMs
    }).then(({ error }) => {
      if (error) {
        console.error('Failed to log search:', error);
      }
    });

    return {
      knowledge: knowledgeResults,
      listings: listingsResults,
      metadata: {
        searchTimeMs,
        knowledgeCount,
        listingCount
      }
    };
  } catch (error) {
    console.error('Retrieval Engine Error:', error);
    throw new Error('Search failed to complete successfully.');
  }
}
