import {
  BarChart3,
  Bot,
  CalendarCheck,
  Home,
  PhoneCall,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Active Properties",
    value: "24",
    change: "+3 this week",
    icon: Home,
  },
  {
    label: "Total Leads",
    value: "187",
    change: "+12 today",
    icon: Users,
  },
  {
    label: "AI Calls Today",
    value: "43",
    change: "89% qualified",
    icon: PhoneCall,
  },
  {
    label: "Appointments",
    value: "8",
    change: "3 upcoming",
    icon: CalendarCheck,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here&apos;s an overview of your agency.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-6 transition hover:border-border/80 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className="size-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-blue-500" />
            <h2 className="font-semibold">AI Agent Activity</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your AI agents handled 43 calls today with an 89% lead qualification
            rate. 12 new leads were captured automatically.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-emerald-500" />
            <h2 className="font-semibold">Weekly Performance</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Revenue is up 15% this week. 8 appointments scheduled, 3 properties
            under contract. Keep the momentum going.
          </p>
        </div>
      </div>
    </div>
  );
}
