"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Share, Download } from "lucide-react";
import Link from "next/link";

export function AppointmentHeader({ appointment }: { appointment: ClientAppointmentDetails }) {
  const propertyTitle = appointment.property?.title || "Property";
  const propertyType = appointment.property?.property_type || "Meeting";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-6 border-b">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/client/appointments" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <span>•</span>
          <span className="font-mono text-xs">ID: {appointment.id.split("-")[0]}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{propertyTitle}</h1>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize">{propertyType.replace("_", " ")}</span>
          <span>•</span>
          <span>
            {format(new Date(appointment.start_time), "EEEE, MMMM d, yyyy")} at {format(new Date(appointment.start_time), "h:mm a")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
