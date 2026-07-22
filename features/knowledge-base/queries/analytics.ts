'use server';

import { createClient } from '@/lib/supabase/server';
import { getAgencyId } from '../actions/categories';

export async function getKnowledgeAnalytics() {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    // 1. Total Entries
    const { count: totalEntries, error: e1 } = await supabase
      .from('knowledge_entries')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId);

    // 2. Active Entries
    const { count: activeEntries, error: e2 } = await supabase
      .from('knowledge_entries')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('status', 'ACTIVE');

    // 3. AI Enabled Entries
    const { count: aiEnabledEntries, error: e3 } = await supabase
      .from('knowledge_entries')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('is_ai_enabled', true);

    // 4. Categories
    const { count: totalCategories, error: e4 } = await supabase
      .from('knowledge_categories')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId);
      
    // 5. Total Usage Count
    // In a real app, this could be sum of usage_count or from logs. Let's just sum usage_count
    const { data: usageData, error: e5 } = await supabase
      .from('knowledge_entries')
      .select('usage_count')
      .eq('agency_id', agencyId);
      
    const aiUsageCount = (usageData || []).reduce((acc, curr) => acc + (curr.usage_count || 0), 0);

    if (e1 || e2 || e3 || e4 || e5) throw new Error('Failed to fetch some analytics');

    return {
      success: true,
      data: {
        totalEntries: totalEntries || 0,
        activeEntries: activeEntries || 0,
        aiEnabledEntries: aiEnabledEntries || 0,
        totalCategories: totalCategories || 0,
        aiUsageCount: aiUsageCount || 0,
      }
    };
  } catch (error: any) {
    console.error('Failed to get knowledge analytics:', error);
    return { success: false, error: error.message };
  }
}
