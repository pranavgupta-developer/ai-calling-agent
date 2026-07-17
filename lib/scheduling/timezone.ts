import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parse, isValid } from 'date-fns';

/**
 * Parses a local date/time string (like '2023-10-25 09:00:00') in a specific timezone
 * and returns a standard UTC Date object.
 */
export function parseInTimezone(dateString: string, timeString: string, timeZone: string): Date {
  const dateTimeString = `${dateString}T${timeString}`;
  // Interpret the local string as if it's in the specified timezone, yielding a UTC Date.
  return fromZonedTime(dateTimeString, timeZone);
}

/**
 * Formats a UTC Date object into a string for a specific timezone.
 */
export function formatTimeInTimezone(date: Date | string, timeZone: string, formatString: string = 'HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, timeZone, formatString);
}

/**
 * Returns the current Date but shifted so its local methods reflect the target timezone's current time.
 * Useful for checking "is this time past?" relative to the agency's timezone.
 */
export function getCurrentDateInTimezone(timeZone: string): Date {
  return toZonedTime(new Date(), timeZone);
}

/**
 * Checks if a given Date (which represents an absolute moment in UTC)
 * is before the current absolute moment.
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}
