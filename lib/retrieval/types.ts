export interface SearchQuery {
  query: string;
  agencyId: string;
  limit?: number;
}

export interface SearchResultMetadata {
  searchTimeMs: number;
  knowledgeCount: number;
  listingCount: number;
}

export interface BaseRankedResult {
  score: number;
}

export interface RankedKnowledge extends BaseRankedResult {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: number;
}

export interface RankedListing extends BaseRankedResult {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  price_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  amenities: string[];
  status: string;
}

export interface SearchResponse {
  knowledge: RankedKnowledge[];
  listings: RankedListing[];
  metadata: SearchResultMetadata;
}
