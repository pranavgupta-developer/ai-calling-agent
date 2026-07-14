import {
  BarChart3,
  Bot,
  CalendarCheck,
  Home,
  PhoneCall,
  Users,
  CheckCircle2,
  Clock,
  Tag,
  Star,
  Activity,
  Archive,
} from "lucide-react";
import { getDashboardData } from "@/lib/actions/dashboard/get-dashboard-data";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentListings } from "@/components/dashboard/recent-listings";

export default async function DashboardPage() {
  const { stats, recentListings, error } = await getDashboardData();

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed text-center p-8">
        <div>
          <h3 className="mt-4 text-lg font-semibold">Unable to load dashboard data.</h3>
          <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        </div>
      </div>
    );
  }

  // Define our 10 stat cards (7 real, 3 placeholder)
  const dashboardStats = [
    {
      label: "Total Listings",
      value: stats?.total || 0,
      icon: Home,
    },
    {
      label: "Available Listings",
      value: stats?.available || 0,
      icon: CheckCircle2,
    },
    {
      label: "Pending Listings",
      value: stats?.pending || 0,
      icon: Clock,
    },
    {
      label: "Sold Listings",
      value: stats?.sold || 0,
      icon: Tag,
    },
    {
      label: "Featured Listings",
      value: stats?.featured || 0,
      icon: Star,
    },
    {
      label: "Active Listings",
      value: stats?.active || 0,
      icon: Activity,
    },
    {
      label: "Inactive Listings",
      value: stats?.inactive || 0,
      icon: Archive,
    },
    {
      label: "Appointments",
      value: 0,
      change: "Coming Soon",
      icon: CalendarCheck,
    },
    {
      label: "Conversations",
      value: 0,
      change: "Coming Soon",
      icon: PhoneCall,
    },
    {
      label: "Conversion Rate",
      value: "0%",
      change: "Coming Soon",
      icon: BarChart3,
    },
  ];

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
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      {/* Recent Listings */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Recent Listings</h2>
        <RecentListings properties={recentListings || []} />
      </div>
    </div>
  );
}
