import { SupabaseClient } from '@supabase/supabase-js';
import { RankedListing } from './types';
import { rankListings } from './ranking';

export async function searchListings(
  supabase: SupabaseClient,
  query: string,
  agencyId: string,
  limit: number = 10
): Promise<RankedListing[]> {
  // Try full text search first
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, description, property_type, listing_type, price, price_type, bedrooms, bathrooms, parking, amenities, status')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .in('status', ['available', 'active'])
    .textSearch('fts', query, {
      type: 'websearch',
      config: 'english'
    })
    .limit(limit * 3); // fetch more for client-side ranking

  if (error) {
    console.error('Error in searchListings (FTS):', error);
    // Do not throw; allow it to gracefully fallback to ilike search below
  }

  let results = data || [];

  // If very few results, fallback to a basic ilike search
  if (results.length < limit / 2) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('properties')
      .select('id, title, description, property_type, listing_type, price, price_type, bedrooms, bathrooms, parking, amenities, status')
      .eq('agency_id', agencyId)
      .eq('is_active', true)
      .in('status', ['available', 'active'])
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,property_type.ilike.%${query}%`)
      .limit(limit * 2);

    if (fallbackError) {
      console.error('Error in searchListings (Fallback):', fallbackError);
    } else if (fallbackData) {
      // Merge results avoiding duplicates
      const existingIds = new Set(results.map(r => r.id));
      const newItems = fallbackData.filter(r => !existingIds.has(r.id));
      results = [...results, ...newItems];
    }
  }

  // Rank and limit
  return rankListings(results, query).slice(0, limit);
}
