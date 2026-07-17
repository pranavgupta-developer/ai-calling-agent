"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>
      
      <div className="mt-8">
        <EmptyState
          title="No Appointments Found"
          description="You haven't scheduled any appointments yet. Appointments booked by AI or manually will appear here."
          icon={<CalendarIcon className="w-6 h-6" />}
          actionLabel="Create Appointment"
          onAction={() => console.log('Create appointment modal...')}
        />
      </div>
    </div>
  );
}
