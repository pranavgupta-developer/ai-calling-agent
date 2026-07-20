import { createClient } from '@/lib/supabase/server';
import { AppointmentStateMachine } from './state-machine';
import { CancelSchema, RescheduleSchema, BaseTransitionSchema } from './validation';
import { TransitionPayload, ReschedulePayload } from './types';
import { EmailOutboxService } from '@/lib/email/outbox';

export class AppointmentService {
  /**
   * Private helper to perform the status update, event logging, and email queueing.
   */
  private static async executeTransition(
    payload: TransitionPayload,
    newStatus: string,
    eventType: string,
    emailTemplate: string,
    emailPayloadData: Record<string, any>,
    updates: Record<string, any> = {}
  ) {
    const supabase = await createClient();

    // 1. Fetch current appointment to check optimistic locking or current state
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', payload.appointmentId)
      .eq('agency_id', payload.agencyId)
      .single();

    if (fetchError || !appointment) {
      throw new Error('Appointment not found or access denied.');
    }

    const currentStatus = appointment.status;

    // 2. Validate transition
    AppointmentStateMachine.validateTransition(currentStatus, newStatus === 'rescheduled_event' ? 'rescheduled' : (newStatus as any));

    // 3. Update appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: newStatus === 'rescheduled_event' ? 'confirmed' : newStatus, // Rescheduling keeps it confirmed but changes time
        ...updates,
      })
      .eq('id', payload.appointmentId)
      .eq('status', currentStatus); // Optimistic locking: ensure status hasn't changed

    if (updateError) {
      throw new Error(`Concurrency error or update failed: ${updateError.message}`);
    }

    // 4. Record Audit Event
    await supabase.from('appointment_events').insert({
      appointment_id: payload.appointmentId,
      agency_id: payload.agencyId,
      event_type: eventType,
      previous_status: currentStatus,
      new_status: newStatus === 'rescheduled_event' ? 'confirmed' : newStatus,
      performed_by: payload.actor.id,
      performed_by_name: payload.actor.name,
      performed_by_email: payload.actor.email,
      performed_by_type: payload.actor.type,
      channel: payload.channel,
      reason: payload.reason,
      metadata: payload.metadata || {},
    });

    // 5. Queue Email
    await EmailOutboxService.queueEmail({
      agencyId: payload.agencyId,
      appointmentId: payload.appointmentId,
      template: emailTemplate,
      payload: {
        appointment,
        updates,
        ...emailPayloadData,
      },
      transactionClient: supabase,
    });

    return { success: true, newStatus: newStatus === 'rescheduled_event' ? 'confirmed' : newStatus };
  }

  static async confirmAppointment(payload: TransitionPayload) {
    const validated = BaseTransitionSchema.parse(payload);
    return this.executeTransition(
      validated,
      'confirmed',
      'appointment_confirmed',
      'appointment-confirmed',
      { reason: payload.reason }
    );
  }

  static async cancelAppointment(payload: TransitionPayload) {
    const validated = CancelSchema.parse(payload);
    return this.executeTransition(
      validated,
      'cancelled',
      'appointment_cancelled',
      'appointment-cancelled',
      { reason: payload.reason }
    );
  }

  static async rescheduleAppointment(payload: ReschedulePayload) {
    const validated = RescheduleSchema.parse(payload);
    
    // Validate business rules (pseudo-code depending on exact business hours logic)
    // BusinessHoursValidator.validate(validated.newStartTime, validated.newEndTime)
    
    return this.executeTransition(
      validated,
      'rescheduled_event', // Internal token for state machine
      'appointment_rescheduled',
      'appointment-rescheduled',
      { newStartTime: validated.newStartTime, newEndTime: validated.newEndTime, reason: payload.reason },
      {
        start_time: validated.newStartTime.toISOString(),
        end_time: validated.newEndTime.toISOString(),
        // Might also recalculate duration if needed
      }
    );
  }

  static async completeAppointment(payload: TransitionPayload) {
    const validated = BaseTransitionSchema.parse(payload);
    return this.executeTransition(
      validated,
      'completed',
      'appointment_completed',
      'appointment-completed', // Optionally we don't send emails for completed, or we send a follow-up/feedback email
      {}
    );
  }

  static async getAppointmentTimeline(agencyId: string, appointmentId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('appointment_events')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
      
    if (error) throw new Error(`Timeline fetch failed: ${error.message}`);
    return data;
  }
}
