'use client';

import React from 'react';
import { AppointmentEvent } from '@/lib/appointments/types';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Calendar, Mail, FileText } from 'lucide-react';

interface TimelineProps {
  events: AppointmentEvent[];
}

export function AppointmentTimeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return <div className="text-gray-500 italic text-sm">No timeline events found.</div>;
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'appointment_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'appointment_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'appointment_rescheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'appointment_completed':
        return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
      case 'email_sent':
        return <Mail className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    return eventType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                    {getEventIcon(event.event_type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {getEventTitle(event.event_type)}
                      </span>{' '}
                      by {event.performed_by_name || event.performed_by_type || 'System'}
                    </p>
                    {event.reason && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Reason: {event.reason}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400 flex flex-col items-end">
                    <time dateTime={event.created_at}>{format(new Date(event.created_at), 'MMM d, h:mm a')}</time>
                    {event.channel && (
                      <span className="text-xs px-2 py-0.5 mt-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {event.channel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
