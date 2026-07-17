'use server';

import { AvailabilityRequest, BookingRequest } from '@/lib/scheduling/types';
import { checkAvailableSlots } from '@/lib/scheduling/availability';
import { createAppointment } from '@/lib/scheduling/booking';
import { SchedulingError } from '@/lib/scheduling/errors';

export async function getAvailableSlotsAction(request: AvailabilityRequest) {
  try {
    const response = await checkAvailableSlots(request);
    // Convert Dates to ISO strings for passing to client components from Server Actions
    const serializedSlots = response.slots.map(slot => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      available: slot.available,
      reason: slot.reason
    }));
    
    return { 
      success: true, 
      data: { ...response, slots: serializedSlots } 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error instanceof SchedulingError ? error.message : 'An error occurred while fetching availability.' 
    };
  }
}

export async function bookAppointmentAction(request: BookingRequest) {
  try {
    const response = await createAppointment(request);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("Booking Error:", error);
    return { 
      success: false, 
      error: error instanceof SchedulingError ? error.message : `An error occurred while booking the appointment: ${error.message || error}` 
    };
  }
}

import { createClient } from '@/lib/supabase/server';

export async function getOrCreateTestClientAction(agencyId: string) {
  try {
    const supabase = await createClient();
    
    // Try to get an existing client
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('agency_id', agencyId)
      .limit(1)
      .maybeSingle();

    if (existingClient) {
      return { success: true, clientId: existingClient.id };
    }

    // Create a new test client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        agency_id: agencyId,
        full_name: 'Test Client',
        email: `test-${Date.now()}@example.com`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, clientId: newClient.id };
  } catch (error: any) {
    console.error("Test Client Error:", error);
    return { success: false, error: error.message };
  }
}
