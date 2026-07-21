import { z } from 'zod';
import { Appointment, AppointmentStatus, PaymentStatus } from '@/types/appointments';
import { Property } from '@/types/property';
import { Agency } from '@/types/agency';

export interface AgencyUser {
  id: string;
  agency_id: string;
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AiAgent {
  id: string;
  agency_id: string;
  name: string;
}

// We create a joined type based on what we'll fetch from Supabase
export interface ClientAppointmentWithDetails extends Appointment {
  property: Pick<Property, 'id' | 'title' | 'property_type' | 'price' | 'price_type'> & {
    // Handling address fields manually if they are on property table
    address?: string | null;
    city?: string | null;
    state?: string | null;
  } | null;
  agency: Pick<Agency, 'id' | 'name' | 'logo_url' | 'phone' | 'email'> | null;
  agency_user?: Pick<AgencyUser, 'id' | 'first_name' | 'last_name' | 'email'> | null;
  ai_agent?: Pick<AiAgent, 'id' | 'name'> | null;
}

export const appointmentSearchParamsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  q: z.string().optional().catch(''),
  status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show']).catch('all'),
  payment: z.enum(['all', 'unpaid', 'paid_online', 'paid_cash', 'refunded']).catch('all'),
  propertyType: z.enum(['all', 'apartment', 'villa', 'commercial', 'office', 'rental', 'sale']).catch('all'),
  dateRange: z.enum(['all', 'today', 'tomorrow', 'this_week', 'this_month', 'custom']).catch('all'),
  sortBy: z.enum(['nearest', 'newest', 'oldest', 'price_asc', 'price_desc', 'agency', 'updated']).catch('nearest'),
});

export type AppointmentSearchParams = z.infer<typeof appointmentSearchParamsSchema>;

export interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}
