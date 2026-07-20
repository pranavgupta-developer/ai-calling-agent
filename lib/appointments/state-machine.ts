import { AppointmentStatus } from './types';

export class AppointmentStateMachine {
  private static readonly transitions: Record<AppointmentStatus, (AppointmentStatus | 'rescheduled')[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['cancelled', 'rescheduled', 'completed', 'no_show'],
    completed: [],
    cancelled: [],
    no_show: [],
  };

  /**
   * Checks if a transition from currentStatus to nextStatus is allowed.
   */
  static canTransition(currentStatus: AppointmentStatus, nextStatus: AppointmentStatus | 'rescheduled'): boolean {
    return this.transitions[currentStatus]?.includes(nextStatus) ?? false;
  }

  /**
   * Validates a transition and throws an error if invalid.
   */
  static validateTransition(currentStatus: AppointmentStatus, nextStatus: AppointmentStatus | 'rescheduled'): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new Error(`Invalid appointment status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }
}
