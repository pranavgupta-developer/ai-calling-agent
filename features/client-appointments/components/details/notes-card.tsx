"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function NotesCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.client_notes) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Appointment Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
          {appointment.client_notes}
        </div>
      </CardContent>
    </Card>
  );
}
