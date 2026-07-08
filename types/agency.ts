export type DayOperatingHours = {
  isOpen: boolean;
  open: string; // e.g. "09:00"
  close: string; // e.g. "17:00"
};

export type OperatingHours = {
  monday: DayOperatingHours;
  tuesday: DayOperatingHours;
  wednesday: DayOperatingHours;
  thursday: DayOperatingHours;
  friday: DayOperatingHours;
  saturday: DayOperatingHours;
  sunday: DayOperatingHours;
};

export type Agency = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  theme_color: string;
  
  // Location
  address: string | null; // Keep for backwards compatibility with old schema
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Settings
  timezone: string;
  business_hours: OperatingHours | null;
  business_type: string | null;
  is_onboarding_completed: boolean;
  
  created_at: string;
  updated_at: string;
};
