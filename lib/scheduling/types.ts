export type TimeSlot = {
  start: Date;
  end: Date;
  available: boolean;
  reason?: 'booked' | 'outside_business_hours' | 'past_time' | 'exception_closed';
};

export type BusinessHour = {
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  opens_at: string; // '09:00:00'
  closes_at: string; // '17:00:00'
  is_open: boolean;
};

export type BusinessHourException = {
  date: string; // 'YYYY-MM-DD'
  is_closed: boolean;
  opens_at?: string;
  closes_at?: string;
  reason?: string;
};

export type AvailabilityRequest = {
  agency_id: string;
  date: string; // 'YYYY-MM-DD'
  duration_minutes: number;
  timezone: string;
  listing_id?: string;
  ai_agent_id?: string;
};

export type AvailabilityResponse = {
  slots: TimeSlot[];
  timezone: string;
  date: string;
};

export type BookingRequest = {
  agency_id: string;
  client_id: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  duration_minutes: number;
  timezone: string;
  appointment_type?: 'property_viewing' | 'consultation' | 'investment' | 'rental' | 'commercial';
  appointment_source?: 'dashboard' | 'website' | 'widget' | 'voice' | 'whatsapp' | 'sms' | 'api';
  listing_id?: string;
  service_id?: string;
  ai_agent_id?: string;
  conversation_id?: string;
  client_notes?: string;
  created_by_ai?: boolean;
  ai_confidence_score?: number;
};
