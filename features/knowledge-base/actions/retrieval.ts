'use server';

import { getAgencyId } from './categories';
import { retrieveKnowledge } from '../ai/retrieval';

export async function testAiRetrieval(query: string) {
  try {
    const agencyId = await getAgencyId();
    
    const results = await retrieveKnowledge(query, agencyId);

    // If we have no results, we could query OpenAI to say "I don't know" based on the knowledge base.
    // For now we just return the raw results from our retrieval engine so the user can inspect them.
    
    return { success: true, data: results };
  } catch (error: any) {
    console.error('Failed to test AI retrieval:', error);
    return { success: false, error: error.message };
  }
}
