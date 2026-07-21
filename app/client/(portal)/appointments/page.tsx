import { AppointmentSummaryCards } from '@/features/client-appointments/components/appointment-summary-cards';
import { AppointmentSearch } from '@/features/client-appointments/components/appointment-search';
import { AppointmentFilters } from '@/features/client-appointments/components/appointment-filters';
import { AppointmentList } from '@/features/client-appointments/components/appointment-list';
import { AppointmentPagination } from '@/features/client-appointments/components/appointment-pagination';
import { getClientAppointments } from '@/features/client-appointments/actions/get-appointments';
import { getAppointmentStats } from '@/features/client-appointments/actions/get-stats';
import { appointmentSearchParamsSchema } from '@/features/client-appointments/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata = {
  title: 'My Appointments | Client Portal',
  description: 'Manage your upcoming and previous property appointments.',
};

export default async function ClientAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  // Parse params safely
  const parsedParams = appointmentSearchParamsSchema.parse({
    page: resolvedParams.page,
    q: resolvedParams.q,
    status: resolvedParams.status,
    payment: resolvedParams.payment,
    propertyType: resolvedParams.propertyType,
    dateRange: resolvedParams.dateRange,
    sortBy: resolvedParams.sortBy,
  });

  const [statsResult, appointmentsResult] = await Promise.all([
    getAppointmentStats(),
    getClientAppointments(parsedParams),
  ]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground text-lg">
          Manage your upcoming and previous property appointments.
        </p>
      </div>

      {/* Stats Error */}
      {statsResult.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading statistics</AlertTitle>
          <AlertDescription>{statsResult.error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {statsResult.data && (
        <AppointmentSummaryCards stats={statsResult.data} />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        
        {/* Controls: Search, Filters, Sort */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
          <AppointmentSearch />
          <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
            <AppointmentFilters />
          </div>
        </div>

        {/* List Error */}
        {appointmentsResult.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading appointments</AlertTitle>
            <AlertDescription>{appointmentsResult.error}</AlertDescription>
          </Alert>
        ) : (
          /* List and Pagination */
          <div className="flex flex-col gap-6">
            <AppointmentList appointments={appointmentsResult.data} />
            <AppointmentPagination totalItems={appointmentsResult.count} pageSize={20} />
          </div>
        )}

      </div>
    </div>
  );
}
