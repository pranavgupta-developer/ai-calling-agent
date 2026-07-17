export const DEFAULT_APPOINTMENT_DURATION = 60; // minutes
export const AVAILABLE_DURATIONS = [30, 45, 60, 90, 120] as const;

export const DEFAULT_BUSINESS_HOURS = [
  { weekday: 1, opens_at: '09:00:00', closes_at: '18:00:00', is_open: true }, // Mon
  { weekday: 2, opens_at: '09:00:00', closes_at: '18:00:00', is_open: true }, // Tue
  { weekday: 3, opens_at: '09:00:00', closes_at: '18:00:00', is_open: true }, // Wed
  { weekday: 4, opens_at: '09:00:00', closes_at: '18:00:00', is_open: true }, // Thu
  { weekday: 5, opens_at: '09:00:00', closes_at: '18:00:00', is_open: true }, // Fri
  { weekday: 6, opens_at: '10:00:00', closes_at: '15:00:00', is_open: true }, // Sat
  { weekday: 0, opens_at: '00:00:00', closes_at: '00:00:00', is_open: false } // Sun
];

export const MAX_ADVANCE_BOOKING_DAYS = 90;
export const MIN_ADVANCE_BOOKING_HOURS = 2; // Can't book less than 2 hours in advance
