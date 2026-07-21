"use server";

import { createClient } from "@/lib/supabase/server";
import { ClientAppointment, ClientAppointmentDetails } from "@/types/client-portal";

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

export async function getAppointmentDetails(id: string): Promise<{
  data: ClientAppointmentDetails | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // According to RLS, if the authenticated client doesn't own this appointment, it won't be returned.
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      agency_id,
      client_id,
      start_time,
      end_time,
      duration_minutes,
      timezone,
      status,
      payment_status,
      appointment_type,
      client_notes,
      internal_notes,
      meeting_url,
      created_at,
      agencies (
        id,
        name,
        theme_color,
        logo_url,
        phone,
        email,
        website,
        address_line_1,
        city,
        state,
        country,
        business_hours (
          weekday,
          opens_at,
          closes_at,
          break_start,
          break_end,
          is_open
        )
      ),
      properties (
        id,
        title,
        property_type,
        listing_type,
        price,
        price_type,
        bedrooms,
        bathrooms,
        parking,
        square_feet,
        year_built,
        amenities,
        description,
        address_line_1,
        city,
        state,
        country,
        property_images (
          url,
          is_primary
        )
      ),
      users!appointments_created_by_fkey (
        id,
        full_name,
        email,
        phone
      ),
      ai_agents (
        id,
        name,
        language
      ),
      appointment_events (
        id,
        event_type,
        created_at,
        performed_by_type,
        new_value
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || "Appointment not found." };
  }

  // Handle properties array from Supabase return format
  const propertyData = data.properties ? (Array.isArray(data.properties) ? data.properties[0] : data.properties) : null;
  const agencyData = data.agencies ? (Array.isArray(data.agencies) ? data.agencies[0] : data.agencies) : null;
  const userData = data.users ? (Array.isArray(data.users) ? data.users[0] : data.users) : null;
  const aiAgentData = data.ai_agents ? (Array.isArray(data.ai_agents) ? data.ai_agents[0] : data.ai_agents) : null;
  
  // Decide who the assigned agent is. Prefer physical user, fallback to AI agent if missing.
  // We assume created_by maps to the assigned agent for physical agents based on standard mapping.
  let agentObj: ClientAppointmentDetails["agent"] = null;
  if (userData) {
    agentObj = {
      id: userData.id,
      name: userData.full_name || "Unknown Agent",
      email: userData.email || null,
      phone: userData.phone || null,
      is_ai: false,
    };
  } else if (aiAgentData) {
    agentObj = {
      id: aiAgentData.id,
      name: aiAgentData.name,
      email: null,
      phone: null,
      is_ai: true,
      language: aiAgentData.language,
    };
  }

  const formattedData: ClientAppointmentDetails = {
    id: data.id,
    agency_id: data.agency_id,
    client_id: data.client_id,
    start_time: data.start_time,
    end_time: data.end_time,
    duration_minutes: data.duration_minutes,
    timezone: data.timezone,
    status: data.status,
    payment_status: data.payment_status,
    appointment_type: data.appointment_type,
    client_notes: data.client_notes,
    internal_notes: data.internal_notes,
    meeting_url: data.meeting_url,
    created_at: data.created_at,
    agency: agencyData
      ? {
          id: agencyData.id,
          name: agencyData.name,
          theme_color: agencyData.theme_color,
          logo_url: agencyData.logo_url || null,
          phone: agencyData.phone || null,
          email: agencyData.email || null,
          website: agencyData.website || null,
          address_line_1: agencyData.address_line_1 || null,
          city: agencyData.city || null,
          state: agencyData.state || null,
          country: agencyData.country || null,
          business_hours: agencyData.business_hours,
        }
      : null,
    property: propertyData
      ? {
          id: propertyData.id,
          title: propertyData.title,
          property_type: propertyData.property_type,
          listing_type: propertyData.listing_type,
          price: propertyData.price,
          price_type: propertyData.price_type,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          parking: propertyData.parking,
          square_feet: propertyData.square_feet,
          year_built: propertyData.year_built,
          amenities: propertyData.amenities || [],
          description: propertyData.description,
          address_line_1: propertyData.address_line_1 || null,
          city: propertyData.city || null,
          state: propertyData.state || null,
          country: propertyData.country || null,
          images: propertyData.property_images,
        }
      : null,
    agent: agentObj,
    events: data.appointment_events || [],
  };

  return { data: formattedData, error: null };
}
