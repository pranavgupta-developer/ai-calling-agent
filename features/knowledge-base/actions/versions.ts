'use server';

import { createClient } from '@/lib/supabase/server';
import { getAgencyId } from './categories';
import { revalidatePath } from 'next/cache';

export async function getEntryVersions(entryId: string) {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    // Verify entry belongs to agency
    const { data: entry } = await supabase
      .from('knowledge_entries')
      .select('id')
      .eq('id', entryId)
      .eq('agency_id', agencyId)
      .single();

    if (!entry) throw new Error('Entry not found or unauthorized');

    const { data: versions, error } = await supabase
      .from('knowledge_entry_versions')
      .select('*')
      .eq('knowledge_entry_id', entryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: versions };
  } catch (error: any) {
    console.error('Failed to get versions:', error);
    return { success: false, error: error.message };
  }
}

export async function restoreVersion(versionId: string) {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    const { data: version, error: versionError } = await supabase
      .from('knowledge_entry_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError || !version) throw new Error('Version not found');

    // Verify entry belongs to agency
    const { data: entry } = await supabase
      .from('knowledge_entries')
      .select('id')
      .eq('id', version.knowledge_entry_id)
      .eq('agency_id', agencyId)
      .single();

    if (!entry) throw new Error('Unauthorized to restore this version');

    // Update entry with version data
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data: updatedEntry, error: updateError } = await supabase
      .from('knowledge_entries')
      .update({
        question: version.question,
        answer: version.answer,
        updated_by: userId,
      })
      .eq('id', version.knowledge_entry_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Create a new version snapshot of the restored version
    await supabase.from('knowledge_entry_versions').insert({
      knowledge_entry_id: updatedEntry.id,
      question: updatedEntry.question,
      answer: updatedEntry.answer,
      changed_by: userId,
    });

    revalidatePath('/dashboard/knowledge-base');
    revalidatePath(`/dashboard/knowledge-base/${updatedEntry.id}`);

    return { success: true, data: updatedEntry };
  } catch (error: any) {
    console.error('Failed to restore version:', error);
    return { success: false, error: error.message };
  }
}
