import { z } from 'zod';
import { AppointmentStatus } from './types';

export const ActorSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['user', 'system', 'client', 'ai']),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const BaseTransitionSchema = z.object({
  agencyId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  actor: ActorSchema,
  channel: z.string().optional(),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const RescheduleSchema = BaseTransitionSchema.extend({
  newStartTime: z.date(),
  newEndTime: z.date(),
}).refine(data => data.newEndTime > data.newStartTime, {
  message: "End time must be after start time",
  path: ["newEndTime"]
});

export const CancelSchema = BaseTransitionSchema.extend({
  reason: z.string().min(1, "Cancellation reason is required"),
});
