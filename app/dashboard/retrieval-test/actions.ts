"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveAgencyId } from "@/lib/auth/agency";
import { search } from "@/lib/retrieval/search";
import { SearchResponse } from "@/lib/retrieval/types";

export async function performSearch(query: string): Promise<{ success: boolean; data?: SearchResponse; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const agencyId = await resolveAgencyId(supabase, user.id);
    
    if (!agencyId) {
      return { success: false, error: "No agency found for the current user" };
    }

    const response = await search(supabase, {
      query,
      agencyId,
      limit: 10
    });

    return { success: true, data: response };

  } catch (error: any) {
    console.error("performSearch Error:", error);
    return { success: false, error: error.message || "An unexpected error occurred during search." };
  }
}
