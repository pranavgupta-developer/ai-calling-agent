import { z } from 'zod';
import { ToolDefinition } from './registry';

export const ListingDetailsTool: ToolDefinition = {
  name: 'get_listing_details',
  description: 'Retrieve detailed information about a specific property listing by its ID.',
  parameters: z.object({
    listingId: z.string().uuid().describe('The UUID of the listing to retrieve'),
  }),
  execute: async ({ listingId }, { supabase, agent }) => {
    try {
      // Respect assigned listings constraint
      if (agent.assigned_listings && agent.assigned_listings.length > 0) {
        if (!agent.assigned_listings.includes(listingId)) {
          return { error: 'You are not authorized to provide details for this listing.' };
        }
      }

      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          property_type,
          listing_type,
          price,
          price_type,
          bedrooms,
          bathrooms,
          parking,
          amenities,
          status,
          address,
          city,
          state,
          zip_code
        `)
        .eq('id', listingId)
        .eq('agency_id', agent.agency_id)
        .single();

      if (error || !data) {
        return { message: 'Listing not found or you do not have permission to view it.' };
      }

      return data;
    } catch (error) {
      console.error('Error in get_listing_details tool:', error);
      throw new Error('Failed to retrieve listing details');
    }
  },
};
