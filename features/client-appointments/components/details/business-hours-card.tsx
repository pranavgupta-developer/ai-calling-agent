"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function BusinessHoursCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.agency || !appointment.agency.business_hours || appointment.agency.business_hours.length === 0) {
    return null;
  }

  // Sort by weekday (0 is Sunday, 1 is Monday...)
  const sortedHours = [...appointment.agency.business_hours].sort((a, b) => a.weekday - b.weekday);

  // Group or format nicely
  const formatTime = (timeStr: string) => {
    // timeStr is usually "09:00:00"
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {sortedHours.map((bh) => (
            <li key={bh.weekday} className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0">
              <span className="text-muted-foreground">{daysOfWeek[bh.weekday]}</span>
              <span className="font-medium">
                {bh.is_open ? `${formatTime(bh.opens_at)} - ${formatTime(bh.closes_at)}` : "Closed"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
