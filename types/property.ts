export type PropertyStatus = "available" | "pending" | "sold";

export interface Property {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  price: number;
  price_type: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  square_feet: number;
  year_built: number;
  amenities: string[];
  status: PropertyStatus;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
}
