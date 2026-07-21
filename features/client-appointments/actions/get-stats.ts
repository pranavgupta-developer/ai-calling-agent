'use server';

import { createClient } from '@/lib/supabase/server';
import { AppointmentStats } from '../types';

export async function getAppointmentStats(): Promise<{
  data: AppointmentStats | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'Unauthorized' };
  }

  // Get client ID
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', user.id)
    .single();

  const clientId = client?.id || user.id;

  // We could do this in a single RPC, but for simplicity we will do a grouped count
  // or just fetch counts in parallel if standard PostgREST doesn't support easy group by
  // Actually, we can just fetch all counts in parallel using head requests.

  const [total, upcoming, completed, cancelled] = await Promise.all([
    // Total
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
      
    // Upcoming (pending/confirmed and in the future)
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString()),
      
    // Completed
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'completed'),
      
    // Cancelled
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'cancelled'),
  ]);

  if (total.error) {
    return { data: null, error: total.error.message };
  }

  return {
    data: {
      total: total.count || 0,
      upcoming: upcoming.count || 0,
      completed: completed.count || 0,
      cancelled: cancelled.count || 0,
    },
    error: null,
  };
}
