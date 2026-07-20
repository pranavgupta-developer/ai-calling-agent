"use server";

import { createClient } from "@/lib/supabase/server";
import { ClientAppointment } from "@/types/client-portal";

export async function getClientAppointments(): Promise<{
  data: ClientAppointment[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // The RLS policy for appointments ensures the client can only see their own appointments.
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      agency_id,
      client_id,
      start_time,
      end_time,
      duration_minutes,
      status,
      payment_status,
      appointment_type,
      client_notes,
      meeting_url,
      created_at,
      agencies (
        id,
        name,
        theme_color
      ),
      properties (
        id,
        title,
        property_images (
          url,
          is_primary
        )
      ),
      users (
        id,
        full_name
      )
    `)
    .order("start_time", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Format the response
  const formattedData: ClientAppointment[] = data.map((appt: Record<string, unknown>) => ({
    id: appt.id as string,
    agency_id: appt.agency_id as string,
    client_id: appt.client_id as string,
    start_time: appt.start_time as string,
    end_time: appt.end_time as string,
    duration_minutes: appt.duration_minutes as number,
    status: appt.status as ClientAppointment["status"],
    payment_status: appt.payment_status as ClientAppointment["payment_status"],
    appointment_type: appt.appointment_type as string,
    client_notes: appt.client_notes as string | null,
    meeting_url: appt.meeting_url as string | null,
    created_at: appt.created_at as string,
    agency: appt.agencies
      ? {
          id: ((appt.agencies as any)[0] || (appt.agencies as any)).id,
          name: ((appt.agencies as any)[0] || (appt.agencies as any)).name,
          theme_color: ((appt.agencies as any)[0] || (appt.agencies as any)).theme_color,
        }
      : null,
    property: appt.properties
      ? {
          id: ((appt.properties as any)[0] || (appt.properties as any)).id,
          title: ((appt.properties as any)[0] || (appt.properties as any)).title,
          images: ((appt.properties as any)[0] || (appt.properties as any)).property_images,
        }
      : null,
    agent: appt.users
      ? {
          id: ((appt.users as any)[0] || (appt.users as any)).id,
          name: ((appt.users as any)[0] || (appt.users as any)).full_name,
        }
      : null,
  }));

  return { data: formattedData, error: null };
}

export async function getAppointment(id: string): Promise<{
  data: ClientAppointment | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      agency_id,
      client_id,
      start_time,
      end_time,
      duration_minutes,
      status,
      payment_status,
      appointment_type,
      client_notes,
      meeting_url,
      created_at,
      agencies (
        id,
        name,
        theme_color,
        address_line_1,
        address_line_2,
        postal_code
      ),
      properties (
        id,
        title,
        property_images (
          url,
          is_primary
        )
      ),
      users (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || "Appointment not found." };
  }

  const formattedData: ClientAppointment = {
    id: data.id,
    agency_id: data.agency_id,
    client_id: data.client_id,
    start_time: data.start_time,
    end_time: data.end_time,
    duration_minutes: data.duration_minutes,
    status: data.status,
    payment_status: data.payment_status,
    appointment_type: data.appointment_type,
    client_notes: data.client_notes,
    meeting_url: data.meeting_url,
    created_at: data.created_at,
    agency: data.agencies
      ? {
          id: ((data.agencies as any)[0] || (data.agencies as any)).id,
          name: ((data.agencies as any)[0] || (data.agencies as any)).name,
          theme_color: ((data.agencies as any)[0] || (data.agencies as any)).theme_color,
        }
      : null,
    property: data.properties
      ? {
          id: ((data.properties as any)[0] || (data.properties as any)).id,
          title: ((data.properties as any)[0] || (data.properties as any)).title,
          images: ((data.properties as any)[0] || (data.properties as any)).property_images,
        }
      : null,
    agent: data.users
      ? {
          id: ((data.users as any)[0] || (data.users as any)).id,
          name: ((data.users as any)[0] || (data.users as any)).full_name,
        }
      : null,
  };

  return { data: formattedData, error: null };
}
