"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from "lucide-react";

export function AppointmentTimeline({ appointment }: { appointment: ClientAppointmentDetails }) {
  // Always include the created event as the first step (bottom of timeline if descending, but let's do chronological)
  const events = [
    {
      id: "created",
      event_type: "created",
      created_at: appointment.created_at,
      performed_by_type: "client",
      new_value: "pending",
    },
    ...appointment.events.map(e => ({
      id: e.id,
      event_type: e.event_type,
      created_at: e.created_at,
      performed_by_type: e.performed_by_type,
      new_value: e.new_value?.status || e.new_value?.new_status || e.event_type,
    })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const getIcon = (type: string, status?: string) => {
    const s = status || type;
    if (s.includes("confirm")) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (s.includes("cancel")) return <XCircle className="h-5 w-5 text-red-500" />;
    if (s.includes("complete")) return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    if (s.includes("reschedule")) return <Clock className="h-5 w-5 text-yellow-500" />;
    if (type === "created") return <Circle className="h-5 w-5 text-muted-foreground" />;
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  const getLabel = (type: string, status?: string) => {
    if (type === "created") return "Appointment Request Created";
    if (type === "status_changed") return `Status changed to ${status}`;
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent pt-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-muted-foreground/20 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getIcon(event.event_type, event.new_value)}
          </div>
          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] px-4 py-3 bg-card border rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h4 className="font-medium text-sm text-foreground">{getLabel(event.event_type, event.new_value)}</h4>
              <time className="text-xs text-muted-foreground">
                {format(new Date(event.created_at), "MMM d, h:mm a")}
              </time>
            </div>
            <p className="text-xs text-muted-foreground">
              By {event.performed_by_type === "ai" ? "AI Agent" : event.performed_by_type === "client" ? "You" : "Agency"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
