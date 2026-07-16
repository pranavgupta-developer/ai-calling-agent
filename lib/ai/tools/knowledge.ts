import { z } from 'zod';
import { ToolDefinition } from './registry';
import { search } from '@/lib/retrieval/search';

export const KnowledgeLookupTool: ToolDefinition = {
  name: 'lookup_knowledge_base',
  description: 'Search the agency knowledge base to answer general questions (e.g., processes, policies, working hours).',
  parameters: z.object({
    query: z.string().describe('The user\'s question or query for the knowledge base'),
  }),
  execute: async ({ query }, { supabase, agent }) => {
    try {
      const response = await search(supabase, {
        query,
        agencyId: agent.agency_id,
        limit: 3,
      });

      const knowledge = response.knowledge || [];

      if (knowledge.length === 0) {
        return { message: 'No relevant information found in the knowledge base.' };
      }

      return knowledge.map(k => ({
        question: k.question,
        answer: k.answer,
      }));
    } catch (error) {
      console.error('Error in lookup_knowledge_base tool:', error);
      throw new Error('Failed to retrieve knowledge base articles');
    }
  },
};
