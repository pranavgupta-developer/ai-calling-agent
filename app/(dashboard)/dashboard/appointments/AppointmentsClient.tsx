'use client';

import { useState } from 'react';
import { AppointmentStats } from '@/components/appointments/AppointmentStats';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { AppointmentSearch } from '@/components/appointments/AppointmentSearch';
import { AppointmentTable } from '@/components/appointments/AppointmentTable';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentDrawer } from '@/components/appointments/AppointmentDrawer';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { ActivityFeed } from '@/components/appointments/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus, Download, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentStatistics } from '@/types/appointments';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { exportAppointmentsAction } from '@/lib/actions/appointments';
import { toast } from 'sonner';

interface AppointmentsClientProps {
  appointments: any[];
  stats: AppointmentStatistics;
}

export function AppointmentsClient({ appointments, stats }: AppointmentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const viewMode = searchParams.get('view') || 'table';

  const setViewMode = (mode: 'table' | 'calendar') => {
    if (viewMode === mode) return;
    const params = new URLSearchParams(searchParams);
    params.set('view', mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filters = Object.fromEntries(searchParams.entries());
      const result = await exportAppointmentsAction(filters);
      
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export successful");
      } else {
        toast.error("Export failed: " + result.error);
      }
    } catch (error) {
      toast.error("Failed to export appointments");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage every appointment across your agency.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <AppointmentStats stats={stats} />
        </div>
        <div className="lg:col-span-1 hidden lg:block">
          {/* A miniature version of the activity feed could go here, or we place it below */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <AppointmentSearch />
              <AppointmentFilters />
            </div>
            
            <div className="flex items-center bg-muted rounded-md p-1 border">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3"
                onClick={() => setViewMode('table')}
              >
                <LayoutList className="h-4 w-4 mr-2" /> Table
              </Button>
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 px-3"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Calendar
              </Button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <AppointmentTable 
              appointments={appointments} 
              onView={(id) => setSelectedAppointmentId(id)} 
            />
          ) : (
            <AppointmentCalendar 
              appointments={appointments} 
              onSelectAppointment={(apt) => setSelectedAppointmentId(apt.id)} 
            />
          )}
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed limit={10} />
        </div>
      </div>


      {selectedAppointmentId && (
        <AppointmentDrawer 
          appointmentId={selectedAppointmentId} 
          onClose={() => setSelectedAppointmentId(null)} 
          appointmentData={appointments.find(a => a.id === selectedAppointmentId)}
        />
      )}

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Create Appointment</h2>
            <p className="text-sm text-muted-foreground">Fill in the details to schedule a new appointment.</p>
          </div>
          <AppointmentForm 
            onSuccess={() => setIsCreateOpen(false)} 
            onCancel={() => setIsCreateOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
