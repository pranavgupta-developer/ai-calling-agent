import { AppointmentEvent } from "@/types/appointments";
import { format } from "date-fns";
import { CheckCircle2Icon, EditIcon, PlusCircleIcon, XCircleIcon, CreditCardIcon } from "lucide-react";

interface AppointmentTimelineProps {
  events: AppointmentEvent[];
}

export function AppointmentTimeline({ events }: AppointmentTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "created": return <PlusCircleIcon className="w-5 h-5 text-blue-500" />;
      case "updated": return <EditIcon className="w-5 h-5 text-gray-500" />;
      case "status_changed": return <CheckCircle2Icon className="w-5 h-5 text-green-500" />;
      case "deleted": return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "payment_updated": return <CreditCardIcon className="w-5 h-5 text-purple-500" />;
      default: return <EditIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 pl-4 border-l-2 border-muted relative">
      {events.map((event) => (
        <div key={event.id} className="relative">
          <div className="absolute -left-[27px] bg-background rounded-full">
            {getEventIcon(event.event_type)}
          </div>
          <div className="pl-4">
            <p className="text-sm font-medium capitalize">
              {event.event_type.replace("_", " ")}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.created_at), "MMM d, yyyy h:mm a")}
            </p>
            {event.new_value && (
              <div className="mt-2 text-xs bg-muted/50 p-2 rounded-md font-mono overflow-x-auto">
                <pre>{JSON.stringify(event.new_value, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="text-sm text-muted-foreground italic pl-4">No events recorded.</div>
      )}
    </div>
  );
}
