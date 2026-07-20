import { getClientAppointments } from "@/lib/actions/client/appointments";
import { AppointmentCard } from "@/components/client-portal/appointment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default async function ClientAppointmentsPage() {
  const { data: appointments, error } = await getClientAppointments();

  if (error || !appointments) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading appointments: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your scheduled appointments.
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground mb-2">No appointments found</h3>
            <p>You haven&apos;t scheduled any appointments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
