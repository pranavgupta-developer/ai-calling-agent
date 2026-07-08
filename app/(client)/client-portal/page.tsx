import { CalendarCheck, Home, MessageSquareText } from "lucide-react";

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your activity and upcoming events.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Upcoming Appointments",
            value: "2",
            icon: CalendarCheck,
            color: "text-blue-500",
          },
          {
            label: "Properties Viewed",
            value: "5",
            icon: Home,
            color: "text-emerald-500",
          },
          {
            label: "Unread Messages",
            value: "3",
            icon: MessageSquareText,
            color: "text-amber-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6 transition hover:border-border/80"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Recent Activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your recent interactions and updates will appear here as your agent
          schedules viewings and communicates on your behalf.
        </p>
      </div>
    </div>
  );
}
