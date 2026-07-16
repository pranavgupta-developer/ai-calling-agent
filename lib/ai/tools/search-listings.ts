import { z } from 'zod';
import { ToolDefinition } from './registry';
import { search } from '@/lib/retrieval/search';

export const SearchListingsTool: ToolDefinition = {
  name: 'search_listings',
  description: 'Search for properties/listings based on user criteria (e.g. price, location, type).',
  parameters: z.object({
    query: z.string().describe('The search query or criteria extracted from the user message'),
    limit: z.number().optional().describe('Maximum number of results to return (default: 5)'),
  }),
  execute: async ({ query, limit = 5 }, { supabase, agent }) => {
    try {
      const response = await search(supabase, {
        query,
        agencyId: agent.agency_id,
        limit,
      });

      let listings = response.listings || [];

      // Filter by assigned listings if the agent has a restricted set
      if (agent.assigned_listings && agent.assigned_listings.length > 0) {
        listings = listings.filter(l => agent.assigned_listings.includes(l.id));
      }

      if (listings.length === 0) {
        return { message: 'No matching properties found based on the search criteria.' };
      }

      // Return a concise summary of the listings for the LLM context
      return listings.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        price_type: l.price_type,
        type: l.property_type,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        status: l.status,
      }));
    } catch (error) {
      console.error('Error in search_listings tool:', error);
      throw new Error('Failed to search listings');
    }
  },
};
