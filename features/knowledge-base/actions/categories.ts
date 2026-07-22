'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { KnowledgeCategoryFormValues, KnowledgeCategorySchema } from '../schemas';

export async function getAgencyId() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // Find agency ID for the user
  const { data: agencyUser } = await supabase
    .from('agency_users')
    .select('agency_id')
    .eq('auth_user_id', user.id)
    .single();

  if (agencyUser) return agencyUser.agency_id;

  const { data: agencyOwner } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (agencyOwner) return agencyOwner.id;

  throw new Error('No agency found for user');
}

export async function createCategory(data: KnowledgeCategoryFormValues) {
  try {
    const agencyId = await getAgencyId();
    const validatedData = KnowledgeCategorySchema.parse(data);

    const supabase = await createClient();

    const { data: newCategory, error } = await supabase
      .from('knowledge_categories')
      .insert({
        ...validatedData,
        agency_id: agencyId,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/knowledge-base/categories');
    revalidatePath('/dashboard/knowledge-base');
    revalidatePath('/dashboard/knowledge-base/new');

    return { success: true, data: newCategory };
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, data: KnowledgeCategoryFormValues) {
  try {
    const agencyId = await getAgencyId();
    const validatedData = KnowledgeCategorySchema.parse(data);

    const supabase = await createClient();

    const { data: updatedCategory, error } = await supabase
      .from('knowledge_categories')
      .update(validatedData)
      .eq('id', id)
      .eq('agency_id', agencyId) // Ensure it belongs to the agency
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/knowledge-base/categories');
    revalidatePath('/dashboard/knowledge-base');

    return { success: true, data: updatedCategory };
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const agencyId = await getAgencyId();
    const supabase = await createClient();

    // Check if category has entries
    const { count, error: countError } = await supabase
      .from('knowledge_entries')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('agency_id', agencyId);

    if (countError) throw countError;
    if (count && count > 0) {
      throw new Error('Cannot delete category because it contains knowledge entries.');
    }

    const { error } = await supabase
      .from('knowledge_categories')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId);

    if (error) throw error;

    revalidatePath('/dashboard/knowledge-base/categories');
    revalidatePath('/dashboard/knowledge-base');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return { success: false, error: error.message };
  }
}
