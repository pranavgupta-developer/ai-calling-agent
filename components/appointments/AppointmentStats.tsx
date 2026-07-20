import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentStatistics } from '@/types/appointments';
import { 
  CalendarCheck, 
  CalendarClock, 
  CalendarDays, 
  CalendarX, 
  CheckCircle2, 
  Clock, 
  UserX 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentStatsProps {
  stats: AppointmentStatistics;
}

export function AppointmentStats({ stats }: AppointmentStatsProps) {
  const items = [
    {
      title: "Total Appointments",
      value: stats.total,
      icon: CalendarDays,
      description: "All time",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Today's Upcoming",
      value: stats.upcoming_today,
      icon: CalendarClock,
      description: "Needs attention",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting confirmation",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CalendarCheck,
      description: "Ready for meeting",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      description: "Successfully finished",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: CalendarX,
      description: "By client or agent",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "No Shows",
      value: stats.no_show,
      icon: UserX,
      description: "Client didn't attend",
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {items.map((item, index) => (
        <Card 
          key={item.title} 
          className="group hover:shadow-md transition-all duration-300 overflow-hidden"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <div className={cn("p-2 rounded-full transition-colors", item.bgColor, "group-hover:bg-opacity-20")}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
