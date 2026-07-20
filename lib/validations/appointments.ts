import { z } from 'zod';

export const appointmentStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const paymentStatusSchema = z.enum(['unpaid', 'pending', 'paid_cash', 'paid_online', 'refunded']);
export const appointmentSourceSchema = z.enum(['dashboard', 'website', 'widget', 'voice', 'whatsapp', 'sms', 'api']);
export const appointmentTypeSchema = z.enum(['property_viewing', 'consultation', 'investment', 'rental', 'commercial']);
export const clientSourceSchema = z.enum(['website', 'widget', 'voice', 'manual', 'import']);

// Common regex for basic validation
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
const timezoneRegex = /^[a-zA-Z_]+\/[a-zA-Z_]+$/; // Basic validation, real validation might need Intl API

export const clientInsertSchema = z.object({
  agency_id: z.string().uuid(),
  full_name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address').nullable().optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').nullable().optional(),
  preferred_language: z.string().min(2).max(10).default('en'),
  source: clientSourceSchema.default('manual'),
  notes: z.string().max(2000).nullable().optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"]
});

export const clientUpdateSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().regex(phoneRegex).nullable().optional(),
  preferred_language: z.string().min(2).max(10).optional(),
  source: clientSourceSchema.optional(),
  notes: z.string().max(2000).nullable().optional(),
});

const appointmentInsertSchemaBase = z.object({
  agency_id: z.string().uuid(),
  client_id: z.string().uuid(),
  listing_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  ai_agent_id: z.string().uuid().nullable().optional(),
  conversation_id: z.string().uuid().nullable().optional(),
  appointment_type: appointmentTypeSchema.default('consultation'),
  appointment_source: appointmentSourceSchema.default('dashboard'),
  status: appointmentStatusSchema.default('pending'),
  payment_status: paymentStatusSchema.default('unpaid'),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  duration_minutes: z.number().int().positive(),
  timezone: z.string().regex(timezoneRegex).default('UTC'),
  client_notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  created_by_ai: z.boolean().default(false),
  ai_confidence_score: z.number().min(0).max(100).nullable().optional(),
});

export const appointmentInsertSchema = appointmentInsertSchemaBase.refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
  path: ["end_time"]
});

const appointmentUpdateSchemaBase = z.object({
  client_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().nullable().optional(),
  service_id: z.string().uuid().nullable().optional(),
  ai_agent_id: z.string().uuid().nullable().optional(),
  conversation_id: z.string().uuid().nullable().optional(),
  appointment_type: appointmentTypeSchema.optional(),
  appointment_source: appointmentSourceSchema.optional(),
  status: appointmentStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  duration_minutes: z.number().int().positive().optional(),
  timezone: z.string().regex(timezoneRegex).optional(),
  client_notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
});

export const appointmentUpdateSchema = appointmentUpdateSchemaBase.refine(data => {
  if (data.start_time && data.end_time) {
    return new Date(data.end_time) > new Date(data.start_time);
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});

export const businessHoursUpdateSchema = z.object({
  opens_at: z.string().regex(timeRegex).optional(),
  closes_at: z.string().regex(timeRegex).optional(),
  break_start: z.string().regex(timeRegex).nullable().optional(),
  break_end: z.string().regex(timeRegex).nullable().optional(),
  is_open: z.boolean().optional(),
  effective_from: z.string().date().optional(),
});

export const businessHourExceptionInsertSchema = z.object({
  agency_id: z.string().uuid(),
  date: z.string().date(),
  is_closed: z.boolean().default(true),
  opens_at: z.string().regex(timeRegex).nullable().optional(),
  closes_at: z.string().regex(timeRegex).nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
});

export const getAppointmentsFilterSchema = z.object({
  q: z.string().optional(),
  status: appointmentStatusSchema.optional(),
  source: appointmentSourceSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  client_id: z.string().optional(),
  ai_agent_id: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
});

export type GetAppointmentsFilterInput = z.infer<typeof getAppointmentsFilterSchema>;

// Form Schemas
export const appointmentFormSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  listing_id: z.string().optional(),
  service_id: z.string().optional(),
  ai_agent_id: z.string().optional(),
  human_agent_id: z.string().optional(),
  appointment_type: appointmentTypeSchema.default('consultation'),
  appointment_source: appointmentSourceSchema.default('dashboard'),
  date: z.date(),
  time: z.string().min(1, 'Time is required'), // Format HH:mm
  duration_minutes: z.coerce.number().min(15, 'Minimum duration is 15 minutes').default(30),
  timezone: z.string().default('UTC'),
  client_notes: z.string().optional(),
  internal_notes: z.string().optional(),
  payment_status: paymentStatusSchema.default('unpaid'),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const rescheduleAppointmentSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'New time is required'),
  duration_minutes: z.coerce.number().min(15).default(30),
  reason: z.string().optional(),
});

export type RescheduleAppointmentValues = z.infer<typeof rescheduleAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for cancellation'),
});

export type CancelAppointmentValues = z.infer<typeof cancelAppointmentSchema>;

export const createAppointmentActionSchema = appointmentInsertSchemaBase.omit({
  agency_id: true,
  status: true,
  created_by_ai: true,
  ai_confidence_score: true,
}).extend({
  status: appointmentStatusSchema.optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
  path: ["end_time"]
});

export const updateAppointmentActionSchema = appointmentUpdateSchemaBase.refine(data => {
  if (data.start_time && data.end_time) {
    return new Date(data.end_time) > new Date(data.start_time);
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});

