import { z } from 'zod';
import { AVAILABLE_DURATIONS } from './constants';

export const AvailabilityRequestSchema = z.object({
  agency_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD'),
  duration_minutes: z.number().refine((val) => AVAILABLE_DURATIONS.includes(val as any), {
    message: `Duration must be one of: ${AVAILABLE_DURATIONS.join(', ')}`
  }),
  timezone: z.string(),
  listing_id: z.string().uuid().optional(),
  ai_agent_id: z.string().uuid().optional(),
});

export const BookingRequestSchema = z.object({
  agency_id: z.string().uuid(),
  client_id: z.string().uuid(),
  start_time: z.string().datetime(), // ISO string
  end_time: z.string().datetime(), // ISO string
  duration_minutes: z.number().positive(),
  timezone: z.string(),
  appointment_type: z.enum(['property_viewing', 'consultation', 'investment', 'rental', 'commercial']).default('consultation'),
  appointment_source: z.enum(['dashboard', 'website', 'widget', 'voice', 'whatsapp', 'sms', 'api']).default('dashboard'),
  listing_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  ai_agent_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
  client_notes: z.string().optional(),
  created_by_ai: z.boolean().default(false),
  ai_confidence_score: z.number().min(0).max(100).optional(),
}).refine(data => new Date(data.start_time) < new Date(data.end_time), {
  message: 'End time must be after start time',
  path: ['end_time']
});
