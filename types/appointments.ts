export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid_cash' | 'paid_online' | 'refunded';
export type AppointmentSource = 'dashboard' | 'website' | 'widget' | 'voice' | 'whatsapp' | 'sms' | 'api';
export type AppointmentType = 'property_viewing' | 'consultation' | 'investment' | 'rental' | 'commercial';
export type ClientSource = 'website' | 'widget' | 'voice' | 'manual' | 'import';

export interface Client {
  id: string;
  agency_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_language: string;
  source: ClientSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ClientInsert {
  id?: string;
  agency_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  preferred_language?: string;
  source?: ClientSource;
  notes?: string | null;
}

export interface ClientUpdate {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  preferred_language?: string;
  source?: ClientSource;
  notes?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface Appointment {
  id: string;
  agency_id: string;
  client_id: string;
  listing_id: string | null;
  service_id: string | null;
  ai_agent_id: string | null;
  conversation_id: string | null;
  appointment_type: AppointmentType;
  appointment_source: AppointmentSource;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  timezone: string;
  client_notes: string | null;
  internal_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_by_ai: boolean;
  ai_confidence_score: number | null;
  google_calendar_event_id: string | null;
  outlook_calendar_event_id: string | null;
  meeting_url: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentInsert {
  id?: string;
  agency_id: string;
  client_id: string;
  listing_id?: string | null;
  service_id?: string | null;
  ai_agent_id?: string | null;
  conversation_id?: string | null;
  appointment_type?: AppointmentType;
  appointment_source?: AppointmentSource;
  status?: AppointmentStatus;
  payment_status?: PaymentStatus;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  timezone?: string;
  client_notes?: string | null;
  internal_notes?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_by_ai?: boolean;
  ai_confidence_score?: number | null;
  google_calendar_event_id?: string | null;
  outlook_calendar_event_id?: string | null;
  meeting_url?: string | null;
}

export interface AppointmentUpdate {
  client_id?: string;
  listing_id?: string | null;
  service_id?: string | null;
  ai_agent_id?: string | null;
  conversation_id?: string | null;
  appointment_type?: AppointmentType;
  appointment_source?: AppointmentSource;
  status?: AppointmentStatus;
  payment_status?: PaymentStatus;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  timezone?: string;
  client_notes?: string | null;
  internal_notes?: string | null;
  updated_by?: string | null;
  ai_confidence_score?: number | null;
  google_calendar_event_id?: string | null;
  outlook_calendar_event_id?: string | null;
  meeting_url?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface AppointmentEvent {
  id: string;
  appointment_id: string;
  agency_id: string;
  event_type: string;
  old_value: any | null;
  new_value: any | null;
  performed_by: string | null;
  performed_by_type: string | null;
  created_at: string;
}

export interface AppointmentEventInsert {
  id?: string;
  appointment_id: string;
  agency_id: string;
  event_type: string;
  old_value?: any | null;
  new_value?: any | null;
  performed_by?: string | null;
  performed_by_type?: string | null;
}

export interface BusinessHours {
  id: string;
  agency_id: string;
  weekday: number;
  opens_at: string;
  closes_at: string;
  break_start: string | null;
  break_end: string | null;
  is_open: boolean;
  effective_from: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHoursInsert {
  id?: string;
  agency_id: string;
  weekday: number;
  opens_at?: string;
  closes_at?: string;
  break_start?: string | null;
  break_end?: string | null;
  is_open?: boolean;
  effective_from?: string;
}

export interface BusinessHoursUpdate {
  opens_at?: string;
  closes_at?: string;
  break_start?: string | null;
  break_end?: string | null;
  is_open?: boolean;
  effective_from?: string;
}

export interface BusinessHourException {
  id: string;
  agency_id: string;
  date: string;
  is_closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
  reason: string | null;
  created_at: string;
}

export interface BusinessHourExceptionInsert {
  id?: string;
  agency_id: string;
  date: string;
  is_closed?: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
  reason?: string | null;
}

export interface BusinessHourExceptionUpdate {
  date?: string;
  is_closed?: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
  reason?: string | null;
}

export interface CalendarAccount {
  id: string;
  agency_id: string;
  provider: 'google' | 'outlook';
  calendar_id: string;
  sync_enabled: boolean;
  provider_account_id: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarAccountInsert {
  id?: string;
  agency_id: string;
  provider: 'google' | 'outlook';
  calendar_id: string;
  sync_enabled?: boolean;
  provider_account_id: string;
}

export interface CalendarAccountUpdate {
  calendar_id?: string;
  sync_enabled?: boolean;
  provider_account_id?: string;
}

export interface AppointmentStatistics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  upcoming_today: number;
}
