"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, XCircle, MessageSquare, Map } from "lucide-react";

export function QuickActionsCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  const isCancellable = ["pending", "confirmed"].includes(appointment.status);
  const isReschedulable = ["pending", "confirmed"].includes(appointment.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="default" className="w-full justify-start" disabled={!isReschedulable}>
          <CalendarClock className="h-4 w-4 mr-2" />
          Reschedule Appointment
        </Button>
        <Button variant="destructive" className="w-full justify-start" disabled={!isCancellable}>
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Appointment
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Agency
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Map className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </CardContent>
    </Card>
  );
}
