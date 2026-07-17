import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Appointment } from "@/types/appointments";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment & { clients?: { full_name: string } };
  onClick?: () => void;
  actions?: ReactNode;
}

export function AppointmentCard({ appointment, onClick, actions }: AppointmentCardProps) {
  const startDate = new Date(appointment.start_time);
  
  return (
    <Card 
      className={`p-4 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-primary/50" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">{appointment.clients?.full_name || "Unknown Client"}</h4>
          <p className="text-sm text-muted-foreground capitalize">
            {appointment.appointment_type.replace('_', ' ')}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <AppointmentStatusBadge status={appointment.status} />
          {appointment.payment_status !== 'unpaid' && (
            <PaymentStatusBadge status={appointment.payment_status} />
          )}
        </div>
      </div>
      
      <div className="space-y-2 mt-4 text-sm">
        <div className="flex items-center text-muted-foreground">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {format(startDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="flex items-center text-muted-foreground">
          <ClockIcon className="w-4 h-4 mr-2" />
          {format(startDate, "h:mm a")} ({appointment.duration_minutes} min)
        </div>
        {appointment.appointment_type !== 'consultation' && (
          <div className="flex items-center text-muted-foreground">
            <MapPinIcon className="w-4 h-4 mr-2" />
            Listing details pending
          </div>
        )}
      </div>

      {actions && (
        <div className="mt-4 pt-4 border-t flex gap-2 justify-end">
          {actions}
        </div>
      )}
    </Card>
  );
}
