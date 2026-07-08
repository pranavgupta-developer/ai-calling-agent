import { CalendarCheck } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          View and manage property showings, client meetings, and follow-up
          appointments.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <CalendarCheck className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No appointments scheduled</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Appointments will appear here when your AI agents or team schedule
          them.
        </p>
      </div>
    </div>
  );
}
