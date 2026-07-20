export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid_cash' | 'paid_online' | 'refunded';
export type AppointmentSource = 'dashboard' | 'website' | 'widget' | 'voice' | 'whatsapp' | 'sms' | 'api';
export type EmailJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AppointmentEvent {
  id: string;
  appointment_id: string;
  agency_id: string;
  event_type: string;
  previous_status?: AppointmentStatus;
  new_status?: AppointmentStatus;
  performed_by?: string;
  performed_by_name?: string;
  performed_by_email?: string;
  performed_by_type?: string;
  channel?: string;
  reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EmailJob {
  id: string;
  agency_id: string;
  appointment_id?: string;
  template: string;
  payload: Record<string, any>;
  status: EmailJobStatus;
  attempts: number;
  last_error?: string;
  created_at: string;
  processed_at?: string;
  updated_at: string;
}

export interface TransitionPayload {
  agencyId: string;
  appointmentId: string;
  actor: {
    id: string;
    type: 'user' | 'system' | 'client' | 'ai';
    name?: string;
    email?: string;
  };
  channel?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface ReschedulePayload extends TransitionPayload {
  newStartTime: Date;
  newEndTime: Date;
}
