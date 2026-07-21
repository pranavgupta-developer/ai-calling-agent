import { ClientAppointmentWithDetails } from '../types';
import { AppointmentCard } from './appointment-card';
import { buttonVariants } from '@/components/ui/button';
import { CalendarSearch } from 'lucide-react';
import Link from 'next/link';

interface AppointmentListProps {
  appointments: ClientAppointmentWithDetails[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/30 rounded-xl border border-dashed border-border/60">
        <div className="bg-primary/5 p-4 rounded-full mb-4">
          <CalendarSearch className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight mb-2">No appointments found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          You haven't booked any property viewings yet or none match your current filters.
        </p>
        <Link 
          href="/client/properties"
          className={buttonVariants({ className: "rounded-full px-8" })}
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
