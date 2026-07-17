import { createClient } from '@/lib/supabase/server';
import { AvailabilityRequest, AvailabilityResponse, BusinessHour, TimeSlot } from './types';
import { generateSlots } from './slot-generator';
import { parseInTimezone } from './timezone';
import { DEFAULT_BUSINESS_HOURS } from './constants';
import { AvailabilityRequestSchema } from './validators';
import { ValidationError } from './errors';
import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export async function checkAvailableSlots(request: AvailabilityRequest): Promise<AvailabilityResponse> {
  // Validate request
  const validated = AvailabilityRequestSchema.safeParse(request);
  if (!validated.success) {
    throw new ValidationError('Invalid availability request', validated.error.format());
  }

  const { agency_id, date, duration_minutes, timezone } = validated.data;
  const supabase = await createClient();

  // 1. Determine weekday for the given date in the agency's timezone
  // Parse date string at noon in target timezone to safely get the day of the week
  const queryDate = parseInTimezone(date, '12:00:00', timezone);
  // date-fns getDay() returns 0 for Sunday, 1 for Monday...
  const weekday = queryDate.getDay(); 

  // 2. Fetch Business Hours & Exceptions
  const [bhResponse, exceptionResponse] = await Promise.all([
    supabase
      .from('business_hours')
      .select('*')
      .eq('agency_id', agency_id)
      .eq('weekday', weekday)
      .single(),
    supabase
      .from('business_hour_exceptions')
      .select('*')
      .eq('agency_id', agency_id)
      .eq('date', date)
      .maybeSingle()
  ]);

  // Use DB business hours or default fallback
  let businessHour: BusinessHour = DEFAULT_BUSINESS_HOURS.find(bh => bh.weekday === weekday) || DEFAULT_BUSINESS_HOURS[0];
  
  if (bhResponse.data) {
    businessHour = bhResponse.data as BusinessHour;
  }

  // Apply Exception if exists
  if (exceptionResponse.data) {
    if (exceptionResponse.data.is_closed) {
      businessHour.is_open = false;
    } else {
      businessHour.is_open = true;
      businessHour.opens_at = exceptionResponse.data.opens_at || businessHour.opens_at;
      businessHour.closes_at = exceptionResponse.data.closes_at || businessHour.closes_at;
    }
  }

  // 3. Fetch Booked Appointments for that day
  // To fetch appointments for a given local day, we need the UTC boundaries of that local day
  const localDayStart = parseInTimezone(date, '00:00:00', timezone);
  const localDayEnd = parseInTimezone(date, '23:59:59', timezone);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('agency_id', agency_id)
    .in('status', ['pending', 'confirmed'])
    .gte('start_time', localDayStart.toISOString())
    .lte('start_time', localDayEnd.toISOString());

  const bookedSlots = (appointments || []).map(apt => ({
    start: new Date(apt.start_time),
    end: new Date(apt.end_time)
  }));

  // 4. Generate Slots
  const slots = generateSlots({
    dateStr: date,
    businessHour,
    durationMinutes: duration_minutes,
    timezone,
    bookedSlots
  });

  return {
    slots,
    timezone,
    date
  };
}
