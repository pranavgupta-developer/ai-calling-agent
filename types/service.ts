export type PricingType = 'FREE' | 'FIXED' | 'HOURLY' | 'COMMISSION' | 'PERCENTAGE' | 'RANGE';

export interface ServiceTemplate {
  id: string;
  slug: string;
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
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  agency_id: string;
  template_id: string | null;
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
  is_custom: boolean;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MergedService {
  id: string;
  templateId: string | null;
  agencyId: string;
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
  source: 'DEFAULT' | 'OVERRIDE' | 'CUSTOM';
  editable: boolean;
  deletable: boolean;
  isCustom: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateServiceInput = Omit<Service, 'id' | 'agency_id' | 'template_id' | 'is_custom' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by' | 'created_by' | 'updated_by'>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
