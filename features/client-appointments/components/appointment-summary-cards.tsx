import { AppointmentStats } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, CalendarClock, CalendarCheck2, CalendarX2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentSummaryCardsProps {
  stats: AppointmentStats;
}

export function AppointmentSummaryCards({ stats }: AppointmentSummaryCardsProps) {
  const cards = [
    {
      title: 'Upcoming',
      value: stats.upcoming,
      description: 'Pending or confirmed',
      icon: CalendarClock,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completed',
      value: stats.completed,
      description: 'Successfully finished',
      icon: CalendarCheck2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      description: 'Cancelled or no-show',
      icon: CalendarX2,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Total Appointments',
      value: stats.total,
      description: 'All time booked',
      icon: CalendarDays,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground tracking-tight">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold tracking-tighter">
                      {card.value}
                    </h2>
                  </div>
                </div>
                <div className={cn("p-3 rounded-2xl", card.bgColor)}>
                  <Icon className={cn("w-5 h-5", card.iconColor)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
