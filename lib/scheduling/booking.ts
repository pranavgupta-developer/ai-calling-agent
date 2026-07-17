import { createClient } from '@/lib/supabase/server';
import { BookingRequest } from './types';
import { BookingRequestSchema } from './validators';
import { DoubleBookingError, ValidationError } from './errors';

/**
 * Creates an appointment using a secure PostgreSQL RPC function.
 * This ensures no double bookings can occur due to race conditions.
 */
export async function createAppointment(request: BookingRequest): Promise<{ id: string }> {
  // Validate request
  const validated = BookingRequestSchema.safeParse(request);
  if (!validated.success) {
    throw new ValidationError('Invalid booking request', validated.error.format());
  }

  const payload = validated.data;
  const supabase = await createClient();

  // Call the secure RPC function. 
  // RLS and advisory locks will be applied inside the DB.
  const { data, error } = await supabase.rpc('book_appointment_safe', {
    p_agency_id: payload.agency_id,
    p_client_id: payload.client_id,
    p_start_time: payload.start_time,
    p_end_time: payload.end_time,
    p_duration_minutes: payload.duration_minutes,
    p_timezone: payload.timezone,
    p_appointment_type: payload.appointment_type,
    p_appointment_source: payload.appointment_source,
    p_listing_id: payload.listing_id || null,
    p_service_id: payload.service_id || null,
    p_ai_agent_id: payload.ai_agent_id || null,
    p_conversation_id: payload.conversation_id || null,
    p_client_notes: payload.client_notes || null,
    p_created_by_ai: payload.created_by_ai,
    p_ai_confidence_score: payload.ai_confidence_score || null
  });

  if (error) {
    if (error.message.includes('DOUBLE_BOOKING_ERROR')) {
      throw new DoubleBookingError();
    }
    throw new Error(`Failed to create appointment: ${error.message}`);
  }

  return { id: data as string };
}
