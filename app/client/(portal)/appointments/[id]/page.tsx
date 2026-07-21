import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Building2, Calendar, Clock, MapPin, User, FileText, Phone, Mail } from "lucide-react";
import { getAppointment } from "@/lib/actions/client/appointments";
import { AppointmentTimeline } from "@/components/client-portal/appointment-timeline";
import { AppointmentStatusBadge, PaymentStatusBadge } from "@/components/client-portal/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ClientAppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: appointment, error } = await getAppointment(id);

  if (error || !appointment) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Appointment Not Found</h2>
        <p className="text-muted-foreground mb-4">
          {error || "The requested appointment could not be found."}
        </p>
        <Link href="/client/appointments" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to Appointments
        </Link>
      </div>
    );
  }

  const propertyImage = appointment.property?.images?.find((img) => img.is_primary)?.url
    || appointment.property?.images?.[0]?.url
    || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/client/appointments" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(appointment.start_time), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-6">
          <AppointmentTimeline status={appointment.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Property info */}
          <Card className="overflow-hidden">
            {propertyImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={propertyImage} 
                alt={appointment.property?.title || "Property"} 
                className="w-full h-48 object-cover"
              />
            )}
            <CardHeader>
              <CardTitle>{appointment.property?.title || "General Consultation"}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {appointment.agency?.name || "Agency"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date
                  </span>
                  <p className="font-medium">{format(new Date(appointment.start_time), "EEEE, MMM d, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time
                  </span>
                  <p className="font-medium">
                    {format(new Date(appointment.start_time), "h:mm a")} - {format(new Date(appointment.end_time), "h:mm a")}
                  </p>
                </div>
              </div>

              {appointment.client_notes && (
                <div className="pt-4 border-t space-y-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Your Notes
                  </span>
                  <p className="text-sm bg-muted p-3 rounded-md">{appointment.client_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Appointment</span>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment</span>
                <PaymentStatusBadge status={appointment.payment_status} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {appointment.agent && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.agent.name}</p>
                    <p className="text-muted-foreground text-xs">Assigned Agent</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{appointment.agency?.name || "Agency"}</p>
                </div>
              </div>
              
              {appointment.meeting_url && (
                <div className="pt-2">
                  <a href={appointment.meeting_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Join Virtual Meeting
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
