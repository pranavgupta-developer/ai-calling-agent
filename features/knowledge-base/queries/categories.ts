'use server';

import { createClient } from '@/lib/supabase/server';
import { getAgencyId } from '../actions/categories';
import { KnowledgeCategory } from '../types';

export async function getKnowledgeCategories() {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('knowledge_categories')
      .select('*')
      .eq('agency_id', agencyId)
      .order('name');

    if (error) throw error;

    return { success: true, data: data as KnowledgeCategory[] };
  } catch (error: any) {
    console.error('Failed to get knowledge categories:', error);
    return { success: false, error: error.message, data: [] };
  }
}
