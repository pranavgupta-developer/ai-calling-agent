'use client';

import { useEffect, useState } from 'react';
import { getAppointmentActivityAction } from '@/lib/actions/appointments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, CheckCircle2, Clock, XCircle, User, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFeedProps {
  limit?: number;
}

export function ActivityFeed({ limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      const result = await getAppointmentActivityAction(limit);
      if (result.success && result.data) {
        setActivities(result.data);
      }
      setIsLoading(false);
    }
    fetchActivity();
  }, [limit]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return <CalendarIcon className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rescheduled':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventDescription = (activity: any) => {
    const clientName = activity.appointment?.client?.full_name || 'A client';
    switch (activity.event_type) {
      case 'created':
        return `${clientName} booked an appointment`;
      case 'confirmed':
        return `Appointment with ${clientName} confirmed`;
      case 'completed':
        return `Appointment with ${clientName} completed`;
      case 'cancelled':
        return `Appointment with ${clientName} was cancelled`;
      case 'rescheduled':
        return `Appointment with ${clientName} rescheduled`;
      case 'no_show':
        return `${clientName} did not show up`;
      default:
        return `Activity updated for ${clientName}`;
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates across all your appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No recent activity found.
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-0.5 bg-muted p-2 rounded-full h-8 w-8 flex items-center justify-center border">
                    {getEventIcon(activity.event_type)}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getEventDescription(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
