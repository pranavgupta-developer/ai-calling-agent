'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { KnowledgeEntryFormValues, KnowledgeEntrySchema } from '../schemas';
import { getAgencyId } from './categories';
import { generateEmbedding } from '../ai/embeddings';

export async function createEntry(data: KnowledgeEntryFormValues) {
  try {
    const agencyId = await getAgencyId();
    const validatedData = KnowledgeEntrySchema.parse(data);

    const supabase = await createClient();
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    // Combine question and answer for search_text
    const searchText = `${validatedData.question} ${validatedData.answer} ${validatedData.keywords.join(' ')}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(`${validatedData.question}\n\n${validatedData.answer}`);

    const { data: newEntry, error } = await supabase
      .from('knowledge_entries')
      .insert({
        agency_id: agencyId,
        category_id: validatedData.category_id,
        question: validatedData.question,
        answer: validatedData.answer,
        keywords: validatedData.keywords,
        priority: validatedData.priority,
        status: validatedData.status,
        is_ai_enabled: validatedData.is_ai_enabled,
        confidence_score: validatedData.confidence_score,
        language: validatedData.language,
        source_type: validatedData.source_type,
        notes: validatedData.notes,
        search_text: searchText,
        embedding: embedding,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Handle relations (services and listings)
    if (validatedData.service_ids.length > 0) {
      const serviceInserts = validatedData.service_ids.map(id => ({
        knowledge_entry_id: newEntry.id,
        service_id: id
      }));
      await supabase.from('knowledge_entry_services').insert(serviceInserts);
    }

    if (validatedData.listing_ids.length > 0) {
      const listingInserts = validatedData.listing_ids.map(id => ({
        knowledge_entry_id: newEntry.id,
        listing_id: id
      }));
      await supabase.from('knowledge_entry_listings').insert(listingInserts);
    }

    // Create initial version
    await supabase.from('knowledge_entry_versions').insert({
      knowledge_entry_id: newEntry.id,
      question: newEntry.question,
      answer: newEntry.answer,
      changed_by: userId,
    });

    revalidatePath('/dashboard/knowledge-base');

    return { success: true, data: newEntry };
  } catch (error: any) {
    console.error('Failed to create entry:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEntry(id: string, data: KnowledgeEntryFormValues) {
  try {
    const agencyId = await getAgencyId();
    const validatedData = KnowledgeEntrySchema.parse(data);

    const supabase = await createClient();
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const searchText = `${validatedData.question} ${validatedData.answer} ${validatedData.keywords.join(' ')}`;
    const embedding = await generateEmbedding(`${validatedData.question}\n\n${validatedData.answer}`);

    const { data: updatedEntry, error } = await supabase
      .from('knowledge_entries')
      .update({
        category_id: validatedData.category_id,
        question: validatedData.question,
        answer: validatedData.answer,
        keywords: validatedData.keywords,
        priority: validatedData.priority,
        status: validatedData.status,
        is_ai_enabled: validatedData.is_ai_enabled,
        confidence_score: validatedData.confidence_score,
        language: validatedData.language,
        source_type: validatedData.source_type,
        notes: validatedData.notes,
        search_text: searchText,
        embedding: embedding,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('agency_id', agencyId)
      .select()
      .single();

    if (error) throw error;

    // Update relations - simple approach: delete existing and re-insert
    await supabase.from('knowledge_entry_services').delete().eq('knowledge_entry_id', id);
    if (validatedData.service_ids.length > 0) {
      const serviceInserts = validatedData.service_ids.map(sid => ({ knowledge_entry_id: id, service_id: sid }));
      await supabase.from('knowledge_entry_services').insert(serviceInserts);
    }

    await supabase.from('knowledge_entry_listings').delete().eq('knowledge_entry_id', id);
    if (validatedData.listing_ids.length > 0) {
      const listingInserts = validatedData.listing_ids.map(lid => ({ knowledge_entry_id: id, listing_id: lid }));
      await supabase.from('knowledge_entry_listings').insert(listingInserts);
    }

    // Create a new version snapshot
    await supabase.from('knowledge_entry_versions').insert({
      knowledge_entry_id: updatedEntry.id,
      question: updatedEntry.question,
      answer: updatedEntry.answer,
      changed_by: userId,
    });

    revalidatePath('/dashboard/knowledge-base');
    revalidatePath(`/dashboard/knowledge-base/${id}`);

    return { success: true, data: updatedEntry };
  } catch (error: any) {
    console.error('Failed to update entry:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEntry(id: string) {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('knowledge_entries')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId);

    if (error) throw error;

    revalidatePath('/dashboard/knowledge-base');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete entry:', error);
    return { success: false, error: error.message };
  }
}
