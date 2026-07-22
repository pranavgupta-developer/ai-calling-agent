'use server';

import { createClient } from '@/lib/supabase/server';
import { getAgencyId } from '../actions/categories';
import { KnowledgeEntry, KnowledgeCategory } from '../types';

export async function getKnowledgeEntries() {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('knowledge_entries')
      .select(`
        *,
        category:category_id (name, color)
      `)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as KnowledgeEntry[] };
  } catch (error: any) {
    console.error('Failed to get knowledge entries:', error);
    console.error('Error details:', error?.message, error?.code, error?.details);
    return { success: false, error: error?.message || 'Unknown error', data: [] };
  }
}

export async function getKnowledgeEntry(id: string) {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('knowledge_entries')
      .select(`
        *,
        category:category_id (name, color),
        services:knowledge_entry_services(service_id),
        listings:knowledge_entry_listings(listing_id)
      `)
      .eq('id', id)
      .eq('agency_id', agencyId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to get knowledge entry:', error);
    return { success: false, error: error.message };
  }
}
