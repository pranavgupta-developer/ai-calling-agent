export class SchedulingError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'SchedulingError';
    this.code = code;
    this.details = details;
  }
}

export class DoubleBookingError extends SchedulingError {
  constructor(message: string = 'The requested time slot is no longer available.', details?: any) {
    super(message, 'DOUBLE_BOOKING', details);
    this.name = 'DoubleBookingError';
  }
}

export class OutsideBusinessHoursError extends SchedulingError {
  constructor(message: string = 'The requested time is outside of business hours.', details?: any) {
    super(message, 'OUTSIDE_BUSINESS_HOURS', details);
    this.name = 'OutsideBusinessHoursError';
  }
}

export class PastTimeError extends SchedulingError {
  constructor(message: string = 'Cannot schedule an appointment in the past.', details?: any) {
    super(message, 'PAST_TIME', details);
    this.name = 'PastTimeError';
  }
}

export class ValidationError extends SchedulingError {
  constructor(message: string = 'Invalid scheduling parameters.', details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
