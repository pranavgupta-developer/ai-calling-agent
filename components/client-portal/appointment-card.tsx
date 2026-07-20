import Link from "next/link";
import { format } from "date-fns";
import { Building2, Calendar, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge, PaymentStatusBadge } from "./status-badge";
import { ClientAppointment } from "@/types/client-portal";

export function AppointmentCard({ appointment }: { appointment: ClientAppointment }) {
  const propertyImage = appointment.property?.images?.find(img => img.is_primary)?.url 
    || appointment.property?.images?.[0]?.url 
    || null;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full bg-muted">
          {propertyImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={propertyImage} 
              alt={appointment.property?.title || "Property"} 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-50" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <PaymentStatusBadge status={appointment.payment_status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">
            {appointment.property?.title || "General Consultation"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {appointment.agency?.name || "Agency"}
          </p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(appointment.start_time), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(appointment.start_time), "h:mm a")} - {format(new Date(appointment.end_time), "h:mm a")}
            </span>
          </div>
          {appointment.agent && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{appointment.agent.name}</span>
            </div>
          )}
          {appointment.meeting_url && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">Virtual Meeting</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => window.location.href = `/client/appointments/${appointment.id}`}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
