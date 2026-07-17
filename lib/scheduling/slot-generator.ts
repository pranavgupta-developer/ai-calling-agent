import { addMinutes, parse, isBefore, isAfter, isEqual } from 'date-fns';
import { TimeSlot, BusinessHour } from './types';
import { parseInTimezone, isPast } from './timezone';

interface SlotGeneratorParams {
  dateStr: string; // 'YYYY-MM-DD'
  businessHour: BusinessHour;
  durationMinutes: number;
  timezone: string;
  bookedSlots: { start: Date; end: Date }[];
}

/**
 * Generates distinct time slots for a single day based on business hours,
 * taking into account booked appointments and past times.
 */
export function generateSlots({
  dateStr,
  businessHour,
  durationMinutes,
  timezone,
  bookedSlots,
}: SlotGeneratorParams): TimeSlot[] {
  const slots: TimeSlot[] = [];

  if (!businessHour.is_open) {
    return slots; // No slots if closed
  }

  // Parse open and close times into absolute UTC Dates in the agency's timezone
  const opensAt = parseInTimezone(dateStr, businessHour.opens_at, timezone);
  const closesAt = parseInTimezone(dateStr, businessHour.closes_at, timezone);

  let currentStart = opensAt;

  while (isBefore(currentStart, closesAt)) {
    const currentEnd = addMinutes(currentStart, durationMinutes);

    // If the slot would end after business hours, break
    if (isAfter(currentEnd, closesAt)) {
      break;
    }

    // Check if slot is in the past
    if (isPast(currentStart)) {
      slots.push({
        start: currentStart,
        end: currentEnd,
        available: false,
        reason: 'past_time',
      });
    } else {
      // Check for overlap with booked appointments
      const isBooked = bookedSlots.some(booked => {
        // Overlap logic: A slot overlaps if it starts before a booking ends AND ends after a booking starts
        return isBefore(currentStart, booked.end) && isAfter(currentEnd, booked.start);
      });

      if (isBooked) {
        slots.push({
          start: currentStart,
          end: currentEnd,
          available: false,
          reason: 'booked',
        });
      } else {
        slots.push({
          start: currentStart,
          end: currentEnd,
          available: true,
        });
      }
    }

    // Move to next slot
    currentStart = currentEnd;
  }

  return slots;
}
