import { globalToolRegistry } from './registry';
import { SearchListingsTool } from './search-listings';
import { ListingDetailsTool } from './listing-details';
import { KnowledgeLookupTool } from './knowledge';
import { AvailabilityTool } from './availability';

// Register all tools automatically
globalToolRegistry.register(SearchListingsTool);
globalToolRegistry.register(ListingDetailsTool);
globalToolRegistry.register(KnowledgeLookupTool);
globalToolRegistry.register(AvailabilityTool);

export { globalToolRegistry };
