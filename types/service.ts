export type PricingType = 'FREE' | 'FIXED' | 'HOURLY' | 'COMMISSION' | 'PERCENTAGE' | 'RANGE';

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  pricing_type: PricingType;
  fixed_price: number | null;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  duration_minutes: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  agency_id: string;
  name: string;
  description: string | null;
  category: string | null;
  pricing_type: PricingType;
  fixed_price: number | null;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  duration_minutes: number | null;
  active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateServiceInput = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
