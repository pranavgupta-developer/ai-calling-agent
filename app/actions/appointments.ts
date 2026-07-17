"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { 
  ClientInsert, ClientUpdate, AppointmentInsert, AppointmentUpdate, 
  AppointmentEventInsert, BusinessHoursUpdate, BusinessHourExceptionInsert, BusinessHourExceptionUpdate,
  CalendarAccountInsert, CalendarAccountUpdate
} from "@/types/appointments";
import {
  clientInsertSchema, clientUpdateSchema, appointmentInsertSchema, appointmentUpdateSchema,
  businessHoursUpdateSchema, businessHourExceptionInsertSchema
} from "@/lib/validations/appointments";

// --- CLIENTS ---

export async function createClientProfile(input: ClientInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = clientInsertSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const { data, error } = await supabase
    .from("clients")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/clients");
  return { data };
}

export async function updateClientProfile(id: string, input: ClientUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = clientUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const { data, error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/clients");
  return { data };
}

export async function deleteClientProfile(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Soft delete
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function getClientProfile(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function listClients(agencyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("agency_id", agencyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

// --- APPOINTMENTS ---

export async function createAppointment(input: AppointmentInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = appointmentInsertSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const payload = {
    ...parsed.data,
    created_by: user.id,
    updated_by: user.id
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };

  await recordAppointmentEvent({
    appointment_id: data.id,
    agency_id: data.agency_id,
    event_type: "created",
    new_value: data,
    performed_by: user.id,
    performed_by_type: "user"
  });

  revalidatePath("/dashboard/appointments");
  return { data };
}

export async function updateAppointment(id: string, input: AppointmentUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = appointmentUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const payload = {
    ...parsed.data,
    updated_by: user.id
  };

  // Fetch old appointment to record event
  const { data: oldData } = await supabase.from("appointments").select("*").eq("id", id).single();

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  if (oldData) {
    let eventType = "updated";
    if (oldData.status !== data.status) eventType = "status_changed";
    if (oldData.payment_status !== data.payment_status) eventType = "payment_updated";

    await recordAppointmentEvent({
      appointment_id: data.id,
      agency_id: data.agency_id,
      event_type: eventType,
      old_value: oldData,
      new_value: data,
      performed_by: user.id,
      performed_by_type: "user"
    });
  }

  revalidatePath("/dashboard/appointments");
  return { data };
}

export async function deleteAppointment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: oldData } = await supabase.from("appointments").select("*").eq("id", id).single();

  // Soft delete
  const { error } = await supabase
    .from("appointments")
    .update({ 
      deleted_at: new Date().toISOString(), 
      deleted_by: user.id,
      status: 'cancelled', // Automatically cancel when soft deleting
      updated_by: user.id
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (oldData) {
     await recordAppointmentEvent({
      appointment_id: id,
      agency_id: oldData.agency_id,
      event_type: "deleted",
      old_value: oldData,
      new_value: { deleted_at: new Date().toISOString(), status: 'cancelled' },
      performed_by: user.id,
      performed_by_type: "user"
    });
  }

  revalidatePath("/dashboard/appointments");
  return { success: true };
}

export async function getAppointment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      clients (*),
      services (*),
      properties (*)
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function listAppointments(agencyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      clients (*)
    `)
    .eq("agency_id", agencyId)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

// --- APPOINTMENT EVENTS ---

export async function recordAppointmentEvent(input: AppointmentEventInsert) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("appointment_events")
    .insert(input);

  if (error) {
    console.error("Failed to record appointment event:", error);
  }
}

export async function listAppointmentEvents(appointmentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointment_events")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

// --- BUSINESS HOURS ---

export async function getBusinessHours(agencyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("agency_id", agencyId)
    .order("weekday", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function updateBusinessHours(id: string, input: BusinessHoursUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = businessHoursUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const { data, error } = await supabase
    .from("business_hours")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/business-hours");
  return { data };
}

// --- BUSINESS HOUR EXCEPTIONS ---

export async function getExceptions(agencyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_hour_exceptions")
    .select("*")
    .eq("agency_id", agencyId)
    .order("date", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function addException(input: BusinessHourExceptionInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = businessHourExceptionInsertSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.message };

  const { data, error } = await supabase
    .from("business_hour_exceptions")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/business-hours");
  return { data };
}

export async function deleteException(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("business_hour_exceptions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/business-hours");
  return { success: true };
}

// --- CALENDAR ACCOUNTS ---

export async function listCalendarAccounts(agencyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_accounts")
    .select("*")
    .eq("agency_id", agencyId);

  if (error) return { error: error.message };
  return { data };
}

export async function createCalendarAccount(input: CalendarAccountInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("calendar_accounts")
    .insert(input)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/calendar");
  return { data };
}

export async function deleteCalendarAccount(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("calendar_accounts")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/calendar");
  return { success: true };
}
