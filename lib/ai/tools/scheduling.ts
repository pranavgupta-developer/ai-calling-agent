import { z } from 'zod';
import { checkAvailableSlots } from '@/lib/scheduling/availability';
import { createAppointment } from '@/lib/scheduling/booking';

/**
 * Definition and execution wrapper for checking available slots via AI.
 * The AI uses this tool to check calendar availability.
 */
export const CheckAvailableSlotsTool = {
  name: 'check_available_slots',
  description: 'Check available appointment slots for a given day.',
  parameters: z.object({
    agency_id: z.string().uuid().describe('The ID of the agency.'),
    date: z.string().describe('The local date to check in YYYY-MM-DD format.'),
    duration_minutes: z.number().describe('Duration of the appointment in minutes. Default is 60.'),
    timezone: z.string().describe('The timezone of the agency, e.g. "America/New_York" or "Asia/Kolkata".')
  }),
  execute: async (args: { agency_id: string; date: string; duration_minutes: number; timezone: string }) => {
    try {
      const result = await checkAvailableSlots(args);
      // Only return available slots to AI to avoid confusing it with booked ones
      const available = result.slots.filter(s => s.available).map(s => ({
        start: s.start.toISOString(),
        end: s.end.toISOString()
      }));
      return JSON.stringify({
        date: result.date,
        timezone: result.timezone,
        available_slots: available,
        message: available.length > 0 
          ? `Found ${available.length} available slots.` 
          : 'No available slots found for this date.'
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }
};

/**
 * Definition and execution wrapper for creating appointments via AI.
 */
export const CreateAppointmentTool = {
  name: 'create_appointment',
  description: 'Create an appointment for a client in the scheduling engine.',
  parameters: z.object({
    agency_id: z.string().uuid().describe('The ID of the agency.'),
    client_id: z.string().uuid().describe('The ID of the client booking the appointment.'),
    start_time: z.string().describe('The start time of the appointment in ISO 8601 format (UTC).'),
    end_time: z.string().describe('The end time of the appointment in ISO 8601 format (UTC).'),
    duration_minutes: z.number().describe('Duration of the appointment in minutes.'),
    timezone: z.string().describe('The local timezone of the agency, e.g. "Asia/Kolkata".'),
    appointment_type: z.enum(['property_viewing', 'consultation', 'investment', 'rental', 'commercial']).default('consultation'),
    ai_agent_id: z.string().uuid().optional().describe('Optional ID of the AI agent handling the booking.')
  }),
  execute: async (args: any) => {
    try {
      const payload = {
        ...args,
        appointment_source: 'voice', // Defaulting to voice if booked by AI
        created_by_ai: true
      };
      const result = await createAppointment(payload);
      return JSON.stringify({
        success: true,
        appointment_id: result.id,
        message: 'Appointment successfully booked.'
      });
    } catch (e: any) {
      return JSON.stringify({ 
        success: false, 
        error: e.message,
        message: 'Failed to book appointment. The slot might be double-booked or outside business hours.' 
      });
    }
  }
};
