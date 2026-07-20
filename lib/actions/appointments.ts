'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { AppointmentService } from '@/lib/appointments/service';
import { revalidatePath } from 'next/cache';
import { 
  getAppointmentsFilterSchema, 
  createAppointmentActionSchema, 
  updateAppointmentActionSchema
} from '@/lib/validations/appointments';


async function getUserAgencyId(userId: string) {
  const adminClient = createAdminClient();
  let { data: agencies } = await adminClient
    .from("agencies")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (agencies?.id) return agencies.id;

  let { data: agencyUser } = await adminClient
    .from("agency_users")
    .select("agency_id")
    .eq("auth_user_id", userId)
    .single();

  return agencyUser?.agency_id;
}

export async function confirmAppointmentAction(appointmentId: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: appointment } = await adminClient.from('appointments').select('agency_id').eq('id', appointmentId).single();
    if (!appointment) throw new Error('Appointment not found');

    await AppointmentService.confirmAppointment({
      agencyId: appointment.agency_id,
      appointmentId,
      actor: { id: user.id, type: 'user', email: user.email },
      reason,
      channel: 'dashboard'
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelAppointmentAction(appointmentId: string, reason: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: appointment } = await adminClient.from('appointments').select('agency_id').eq('id', appointmentId).single();
    if (!appointment) throw new Error('Appointment not found');

    await AppointmentService.cancelAppointment({
      agencyId: appointment.agency_id,
      appointmentId,
      actor: { id: user.id, type: 'user', email: user.email },
      reason,
      channel: 'dashboard'
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rescheduleAppointmentAction(appointmentId: string, newStartTime: string, newEndTime: string, reason?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: appointment } = await adminClient.from('appointments').select('agency_id').eq('id', appointmentId).single();
    if (!appointment) throw new Error('Appointment not found');

    await AppointmentService.rescheduleAppointment({
      agencyId: appointment.agency_id,
      appointmentId,
      actor: { id: user.id, type: 'user', email: user.email },
      newStartTime: new Date(newStartTime),
      newEndTime: new Date(newEndTime),
      reason,
      channel: 'dashboard'
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeAppointmentAction(appointmentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: appointment } = await adminClient.from('appointments').select('agency_id').eq('id', appointmentId).single();
    if (!appointment) throw new Error('Appointment not found');

    await AppointmentService.completeAppointment({
      agencyId: appointment.agency_id,
      appointmentId,
      actor: { id: user.id, type: 'user', email: user.email },
      channel: 'dashboard'
    });

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentsAction(rawFilters: any) {
  try {
    const filters = getAppointmentsFilterSchema.parse(rawFilters);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const agency_id = await getUserAgencyId(user.id);

    if (!agency_id) {
      throw new Error("Agency not found");
    }

    const adminClient = createAdminClient();

    let query = adminClient
      .from("appointments")
      .select(`
        *,
        client:clients(full_name, email, phone)
      `, { count: "exact" })
      .eq("agency_id", agency_id)
      .is("deleted_at", null);

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.source) query = query.eq("appointment_source", filters.source);
    if (filters.payment_status) query = query.eq("payment_status", filters.payment_status);
    
    if (filters.date_from) query = query.gte("start_time", filters.date_from);
    if (filters.date_to) query = query.lte("start_time", filters.date_to);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order("start_time", { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      appointments: data as any[],
      count: count || 0,
      page,
      limit,
    };
  } catch (error: any) {
    console.error("Error fetching appointments:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(error.message || "Failed to fetch appointments");
  }
}

export async function getAppointmentStatsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const agency_id = await getUserAgencyId(user.id);
  if (!agency_id) throw new Error("Agency not found");

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from("appointments")
    .select("status")
    .eq("agency_id", agency_id)
    .is("deleted_at", null);

  if (error) throw new Error("Failed to fetch stats");

  return {
    total: data.length,
    pending: data.filter(a => a.status === 'pending').length,
    confirmed: data.filter(a => a.status === 'confirmed').length,
    completed: data.filter(a => a.status === 'completed').length,
    cancelled: data.filter(a => a.status === 'cancelled').length,
    no_show: data.filter(a => a.status === 'no_show').length,
    upcoming_today: 0,
  };
}

export async function checkAvailableSlotsAction(date: string) {
  // Mock available slots
  return {
    morning: ["09:00", "09:30", "10:00", "11:00"],
    afternoon: ["13:00", "14:30", "15:00", "16:00"],
    evening: ["17:00", "18:00"],
  };
}

export async function createAppointmentAction(rawData: any) {
  try {
    const data = createAppointmentActionSchema.parse(rawData);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    const agency_id = await getUserAgencyId(user.id);
    if (!agency_id) throw new Error('Agency not found');

    const appointmentInsert = {
      agency_id: agency_id,
      client_id: data.client_id,
      listing_id: data.listing_id || null,
      service_id: data.service_id || null,
      ai_agent_id: data.ai_agent_id || null,
      appointment_type: data.appointment_type,
      appointment_source: data.appointment_source,
      payment_status: data.payment_status,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes,
      timezone: data.timezone,
      client_notes: data.client_notes || null,
      internal_notes: data.internal_notes || null,
      created_by: user.id,
      status: 'pending',
    };

    const adminClient = createAdminClient();

    const { data: newAppointment, error } = await adminClient
      .from('appointments')
      .insert(appointmentInsert)
      .select()
      .single();

    if (error) throw error;
    
    // Create an event for creation
    await adminClient.from('appointment_events').insert({
      appointment_id: newAppointment.id,
      agency_id: agency_id,
      event_type: 'created',
      performed_by: user.id,
      performed_by_type: 'user',
      new_value: newAppointment
    });

    revalidatePath('/dashboard/appointments');
    return { success: true, data: newAppointment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAppointmentAction(appointmentId: string, rawData: any) {
  try {
    const data = updateAppointmentActionSchema.parse(rawData);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: appointment } = await adminClient.from('appointments').select('agency_id').eq('id', appointmentId).single();
    if (!appointment) throw new Error('Appointment not found');



    const { error } = await adminClient
      .from('appointments')
      .update({ ...data, updated_by: user.id, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (error) throw error;

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAppointmentAction(appointmentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('appointments')
      .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq('id', appointmentId);

    if (error) throw error;

    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentAction(appointmentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('appointments')
      .select(`
        *,
        client:clients(full_name, email, phone, preferred_language, source),
        listing:properties(id, title, property_type, price, address),
        ai_agent:ai_agents(id, name)
      `)
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkDeleteAppointmentsAction(appointmentIds: string[]) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('appointments')
      .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
      .in('id', appointmentIds);

    if (error) throw error;
    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateStatusAction(appointmentIds: string[], status: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('appointments')
      .update({ status, updated_by: user.id, updated_at: new Date().toISOString() })
      .in('id', appointmentIds);

    if (error) throw error;
    revalidatePath('/dashboard/appointments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportAppointmentsAction(rawFilters: any) {
  try {
    const filters = getAppointmentsFilterSchema.parse(rawFilters || {});
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const agency_id = await getUserAgencyId(user.id);
    if (!agency_id) throw new Error('Agency not found');

    const adminClient = createAdminClient();

    let query = adminClient
      .from('appointments')
      .select(`
        id, start_time, end_time, duration_minutes, status, payment_status, appointment_source,
        client:clients(full_name, email)
      `)
      .eq('agency_id', agency_id)
      .is('deleted_at', null);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.date_from) query = query.gte('start_time', filters.date_from);
    if (filters?.date_to) query = query.lte('start_time', filters.date_to);

    const { data, error } = await query;
    if (error) throw error;
    
    // Formatting as CSV
    const header = ['ID', 'Date', 'Time', 'Duration', 'Status', 'Payment', 'Source', 'Client Name', 'Client Email'].join(',');
    const rows = (data as any[]).map(row => {
       const dateObj = new Date(row.start_time);
       return [
         row.id,
         dateObj.toLocaleDateString(),
         dateObj.toLocaleTimeString(),
         row.duration_minutes,
         row.status,
         row.payment_status,
         row.appointment_source,
         `"${row.client?.full_name || ''}"`,
         `"${row.client?.email || ''}"`
       ].join(',');
    });

    return { success: true, csv: [header, ...rows].join('\n') };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentTimelineAction(appointmentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('appointment_events')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAppointmentConversationAction(appointmentId: string) {
  // Mock conversation action until Week 6 module is complete
  return {
    success: true,
    data: {
      summary: "Client is very interested in 3BR properties in downtown.",
      lead_qualification: "High",
      budget: "$500,000 - $700,000",
      intent: "Buy",
      transcript: "AI: Hello, how can I help you?\nClient: I'm looking for a 3-bedroom apartment in downtown.\nAI: Great, what is your budget?\nClient: Around $600k.",
      recording_url: null,
      confidence_score: 92
    }
  };
}

export async function getAppointmentActivityAction(limit = 10) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    const agency_id = await getUserAgencyId(user.id);
    if (!agency_id) throw new Error('Agency not found');

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('appointment_events')
      .select(`
        *,
        appointment:appointments(
          client:clients(full_name)
        )
      `)
      .eq('agency_id', agency_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

