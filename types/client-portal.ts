// Assuming types/supabase exists, I might not have exact Database types but let's define what we need

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid_cash"
  | "paid_online"
  | "refunded";

export interface ClientProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_language: string;
  notes?: string;
}

export interface ClientAppointment {
  id: string;
  agency_id: string;
  client_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  appointment_type: string;
  client_notes: string | null;
  meeting_url: string | null;
  created_at: string;
  agency: {
    id: string;
    name?: string;
    theme_color?: string;
  } | null;
  property: {
    id: string;
    title: string;
    images?: { url: string; is_primary: boolean }[];
  } | null;
  agent: {
    id: string;
    name: string;
  } | null;
}

export interface ClientAppointmentDetails extends ClientAppointment {
  timezone: string;
  internal_notes: string | null; // not usually shown to client, but might be needed if they own it or we need it for logic
  property: {
    id: string;
    title: string;
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
    description: string;
    address_line_1: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    images?: { url: string; is_primary: boolean }[];
  } | null;
  agency: {
    id: string;
    name: string;
    theme_color: string;
    logo_url: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address_line_1: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    business_hours?: {
      weekday: number;
      opens_at: string;
      closes_at: string;
      break_start: string | null;
      break_end: string | null;
      is_open: boolean;
    }[];
  } | null;
  agent: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    is_ai: boolean;
    language?: string;
  } | null;
  events: {
    id: string;
    event_type: string;
    created_at: string;
    performed_by_type: string | null;
    new_value: any | null;
  }[];
}
