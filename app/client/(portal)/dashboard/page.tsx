import { Suspense } from "react";
import { Calendar, CheckCircle2, Clock, XCircle, Bell } from "lucide-react";
import { getClientAppointments } from "@/lib/actions/client/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentCard } from "@/components/client-portal/appointment-card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ClientDashboardPage() {
  const { data: appointments, error } = await getClientAppointments();

  if (error || !appointments) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const upcoming = appointments.filter((a) => a.status === "confirmed" || a.status === "pending");
  const completed = appointments.filter((a) => a.status === "completed");
  const pending = appointments.filter((a) => a.status === "pending");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your appointments and activity.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelled.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Placeholder */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Bell className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-1">No new notifications</h3>
          <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
        </CardContent>
      </Card>

      {/* Next Appointment */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Your Next Appointment</h2>
        {upcoming.length > 0 ? (
          <div className="max-w-md">
            <AppointmentCard appointment={upcoming[0]} />
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-4 opacity-50" />
              <p>No upcoming appointments found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
