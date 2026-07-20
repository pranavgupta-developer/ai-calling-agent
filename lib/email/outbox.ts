import { createClient } from '@/lib/supabase/server';
import { EmailJobStatus } from '../appointments/types';

export interface QueueEmailParams {
  agencyId: string;
  appointmentId?: string;
  template: string;
  payload: Record<string, any>;
  transactionClient?: any; // Allows passing an active supabase client during a transaction
}

export class EmailOutboxService {
  /**
   * Queues an email for background processing.
   * Can accept a transaction client to participate in the same database transaction.
   */
  static async queueEmail(params: QueueEmailParams) {
    const supabase = params.transactionClient || await createClient();

    const { error } = await supabase.from('email_jobs').insert({
      agency_id: params.agencyId,
      appointment_id: params.appointmentId,
      template: params.template,
      payload: params.payload,
      status: 'pending' as EmailJobStatus,
      attempts: 0,
    });

    if (error) {
      console.error('Failed to queue email job:', error);
      throw new Error('Failed to queue email for sending.');
    }
  }
}
