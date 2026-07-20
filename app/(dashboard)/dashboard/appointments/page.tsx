import { getAppointmentsAction, getAppointmentStatsAction } from '@/lib/actions/appointments';
import { AppointmentsClient } from './AppointmentsClient';

export const metadata = {
  title: 'Appointments | Dashboard',
  description: 'Manage every appointment across your agency.',
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await search params before passing them to actions
  const params = await Promise.resolve(searchParams);
  
  // Clean up params for the action
  const filters = {
    page: typeof params.page === 'string' ? parseInt(params.page) : 1,
    limit: 20,
    q: typeof params.q === 'string' ? params.q : undefined,
    status: typeof params.status === 'string' ? params.status : undefined,
    source: typeof params.source === 'string' ? params.source : undefined,
    payment_status: typeof params.payment_status === 'string' ? params.payment_status : undefined,
  };

  const [appointmentsRes, stats] = await Promise.all([
    getAppointmentsAction(filters),
    getAppointmentStatsAction(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AppointmentsClient 
        appointments={appointmentsRes.appointments || []} 
        stats={stats} 
      />
    </div>
  );
}
