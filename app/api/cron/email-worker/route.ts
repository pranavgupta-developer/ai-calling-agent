import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { AppointmentConfirmedEmail } from '@/lib/email/templates/appointment-confirmed';
import { AppointmentRescheduledEmail } from '@/lib/email/templates/appointment-rescheduled';
import { AppointmentCancelledEmail } from '@/lib/email/templates/appointment-cancelled';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

const TEMPLATES: Record<string, React.FC<any>> = {
  'appointment-confirmed': AppointmentConfirmedEmail,
  'appointment-rescheduled': AppointmentRescheduledEmail,
  'appointment-cancelled': AppointmentCancelledEmail,
};

export async function GET(request: Request) {
  // Optional: Secure this endpoint with a cron secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createClient();

  // 1. Fetch pending or failed jobs (up to max 3 attempts)
  const { data: jobs, error: fetchError } = await supabase
    .from('email_jobs')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lt('attempts', 3)
    .order('created_at', { ascending: true })
    .limit(10);

  if (fetchError) {
    console.error('Failed to fetch email jobs:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  const processedJobIds = [];

  for (const job of jobs) {
    try {
      // Mark as processing
      await supabase
        .from('email_jobs')
        .update({ status: 'processing', attempts: job.attempts + 1 })
        .eq('id', job.id);

      const TemplateComponent = TEMPLATES[job.template];
      if (!TemplateComponent) {
        throw new Error(`Template not found: ${job.template}`);
      }

      let toEmail = job.payload?.appointment?.client_email;

      // Fallback: Fetch client email if not in payload
      if (!toEmail && job.payload?.appointment?.client_id) {
         const { data: clientData } = await supabase
           .from('clients')
           .select('email')
           .eq('id', job.payload.appointment.client_id)
           .single();
         toEmail = clientData?.email;
      }

      if (!toEmail) {
        throw new Error('No recipient email address found.');
      }

      // Send email via Resend
      const { data: resendData, error: resendError } = await resend.emails.send({
        from: 'Appointments <no-reply@yourdomain.com>', // Should be configured based on agency
        to: toEmail,
        subject: `Update regarding your appointment`,
        react: React.createElement(TemplateComponent, job.payload),
      });

      if (resendError) {
        throw new Error(`Resend API Error: ${resendError.message}`);
      }

      // Mark as completed
      await supabase
        .from('email_jobs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      processedJobIds.push(job.id);
    } catch (error: any) {
      console.error(`Error processing job ${job.id}:`, error);
      // Mark as failed
      await supabase
        .from('email_jobs')
        .update({
          status: 'failed',
          last_error: error.message || String(error),
        })
        .eq('id', job.id);
    }
  }

  return NextResponse.json({ success: true, processed: processedJobIds.length, jobs: processedJobIds });
}
