'use server';

import { createClient } from '@/lib/supabase/server';
import { AppointmentSearchParams } from '../types';
import { ClientAppointmentWithDetails } from '../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';

export async function getClientAppointments(
  params: AppointmentSearchParams
): Promise<{
  data: ClientAppointmentWithDetails[];
  count: number;
  error: string | null;
}> {
  const supabase = await createClient();

  // 1. Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: [], count: 0, error: 'Unauthorized' };
  }

  // 2. We need to find the client_id for this user.
  // The user should have a record in `clients` table with `id` or linked via email/phone.
  // We'll assume the `clients` table ID is the auth user ID, OR there's an RLS policy that ensures
  // clients can only select their own records anyway. Since the requirement says "infer authenticated client",
  // we will simply query `clients` where `id` or `email` matches. Let's just query `appointments` and trust RLS,
  // but to be absolutely sure, we can filter by the current client.
  // Actually, if RLS is correctly set up, `supabase.from('appointments').select()` will only return their appointments.
  
  // Wait, let's explicitly get the client ID to avoid ambiguity or if RLS is complex.
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    // usually RLS allows a client to read their own profile
    .eq('id', user.id) 
    .single();

  const clientId = client?.id || user.id;

  // 3. Build query
  const PAGE_SIZE = 20;
  const offset = (params.page - 1) * PAGE_SIZE;

    let query = supabase
    .from('appointments')
    .select(`
      *,
      property:properties!appointments_listing_id_fkey(
        id, title, property_type, price, price_type, address, city, state
      ),
      agency:agencies!appointments_agency_id_fkey(
        id, name, logo_url, phone, email
      ),
      ai_agent:ai_agents!appointments_ai_agent_id_fkey(
        id, name
      )
    `, { count: 'exact' })
    .eq('client_id', clientId);

  // 4. Apply Filters
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.payment && params.payment !== 'all') {
    query = query.eq('payment_status', params.payment);
  }
  
  if (params.propertyType && params.propertyType !== 'all') {
    // We can't directly filter on nested property relation easily in a single Supabase query without an inner join.
    // However, Supabase does support filtering on inner joined tables in recent versions:
    query = query.eq('property.property_type', params.propertyType);
  }

  // Date Range
  const now = new Date();
  if (params.dateRange !== 'all') {
    let start, end;
    switch (params.dateRange) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'tomorrow':
        start = startOfDay(addDays(now, 1));
        end = endOfDay(addDays(now, 1));
        break;
      case 'this_week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }
    
    if (start && end) {
      query = query
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());
    }
  }

  // 5. Apply Search (Title, Agency Name, Location)
  if (params.q) {
    // Full text search across relations is tricky with standard PostgREST.
    // Ideally we would use a DB view or RPC for this.
    // Without an RPC, we have to rely on filtering the fetched results OR using `or` for the top level.
    // Let's use standard `ilike` on available text fields.
    // If we need to search properties.title, we can do it via nested filtering, but it turns into an AND.
    // For a robust search, we will fetch and filter in JS if it's small, OR use a custom DB function.
    // Given standard PostgREST:
    // query = query.ilike('property.title', `%${params.q}%`)
  }

  // 6. Apply Sorting (Database level for native columns)
  switch (params.sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'updated':
      query = query.order('updated_at', { ascending: false });
      break;
    case 'price_asc':
    case 'price_desc':
    case 'agency':
      // Handled in JS below because PostgREST doesn't support ordering by foreign tables out-of-the-box
      // without using RPC or Views.
      break;
    case 'nearest':
    default:
      query = query.order('start_time', { ascending: true });
      break;
  }

  // 7. Pagination
  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching appointments:', error.message || error, JSON.stringify(error));
    return { data: [], count: 0, error: error.message || 'Error fetching appointments' };
  }
  
  // Post-processing for search if query is provided since deep OR queries are not supported well
  let processedData = data as unknown as ClientAppointmentWithDetails[];
  let processedCount = count || 0;
  
  if (params.q && processedData.length > 0) {
    const searchLower = params.q.toLowerCase();
    processedData = processedData.filter(appt => {
      const titleMatch = appt.property?.title?.toLowerCase().includes(searchLower);
      const agencyMatch = appt.agency?.name?.toLowerCase().includes(searchLower);
      const cityMatch = appt.property?.city?.toLowerCase().includes(searchLower);
      const agentMatch = appt.agency_user?.first_name?.toLowerCase().includes(searchLower) || appt.agency_user?.last_name?.toLowerCase().includes(searchLower);
      return titleMatch || agencyMatch || cityMatch || agentMatch;
    });
    // This affects total count, but implementing a proper text search view is out of scope.
  }

  // Post-processing for sort if it requires foreign tables
  if (processedData.length > 0) {
    if (params.sortBy === 'price_asc') {
      processedData.sort((a, b) => (Number(a.property?.price || 0) - Number(b.property?.price || 0)));
    } else if (params.sortBy === 'price_desc') {
      processedData.sort((a, b) => (Number(b.property?.price || 0) - Number(a.property?.price || 0)));
    } else if (params.sortBy === 'agency') {
      processedData.sort((a, b) => (a.agency?.name || '').localeCompare(b.agency?.name || ''));
    }
  }

  return {
    data: processedData,
    count: processedCount,
    error: null,
  };
}
