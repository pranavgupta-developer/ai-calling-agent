'use client';

import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AppointmentPreviewProps {
  slot: { start: string; end: string } | null;
  durationMinutes: number;
  timezone: string;
}

export function AppointmentPreview({ slot, durationMinutes, timezone }: AppointmentPreviewProps) {
  if (!slot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Summary</CardTitle>
          <CardDescription>Select a time slot to see details</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const startDate = parseISO(slot.start);
  
  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <CardTitle>Appointment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{format(startDate, 'EEEE, MMMM do, yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">
            {format(startDate, 'HH:mm')} ({durationMinutes} mins)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timezone</span>
          <span className="font-medium">{timezone}</span>
        </div>
      </CardContent>
    </Card>
  );
}
