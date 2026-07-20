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
