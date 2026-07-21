"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Globe, MapPin, User, Building } from "lucide-react";

export function AppointmentSummaryCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  const isAgent = appointment.agent !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Appointment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Date
            </span>
            <span className="font-medium">{format(new Date(appointment.start_time), "MMM d, yyyy")}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Time
            </span>
            <span className="font-medium">
              {format(new Date(appointment.start_time), "h:mm a")} - {format(new Date(appointment.end_time), "h:mm a")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Duration
            </span>
            <span className="font-medium">{appointment.duration_minutes} minutes</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Globe className="h-4 w-4" /> Timezone
            </span>
            <span className="font-medium">{appointment.timezone}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" /> Assigned Agent
            </span>
            <span className="font-medium">{isAgent ? appointment.agent?.name : "Pending Assignment"}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building className="h-4 w-4" /> Meeting Type
            </span>
            <span className="font-medium capitalize">{appointment.appointment_type.replace("_", " ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
