import { notFound } from "next/navigation";
import { getAppointmentDetails } from "@/lib/actions/client/appointments";
import { AppointmentHeader } from "@/features/client-appointments/components/details/appointment-header";
import { PropertyGallery } from "@/features/client-appointments/components/details/property-gallery";
import { AppointmentSummaryCard } from "@/features/client-appointments/components/details/appointment-summary-card";
import { PropertyCard } from "@/features/client-appointments/components/details/property-card";
import { PropertyAmenities } from "@/features/client-appointments/components/details/property-amenities";
import { AppointmentTimeline } from "@/features/client-appointments/components/details/appointment-timeline";
import { AgencyCard } from "@/features/client-appointments/components/details/agency-card";
import { AgentCard } from "@/features/client-appointments/components/details/agent-card";
import { PaymentStatusCard } from "@/features/client-appointments/components/details/payment-status-card";
import { LocationCard } from "@/features/client-appointments/components/details/location-card";
import { NotesCard } from "@/features/client-appointments/components/details/notes-card";
import { BusinessHoursCard } from "@/features/client-appointments/components/details/business-hours-card";
import { QuickActionsCard } from "@/features/client-appointments/components/details/quick-actions-card";
import { ErrorState } from "@/features/client-appointments/components/details/error-state";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { data: appointment, error } = await getAppointmentDetails(id);

  if (error || !appointment) {
    // If the appointment doesn't exist or doesn't belong to the client, return 404 behavior or error state
    if (error === "Appointment not found." || !appointment) {
      notFound();
    }
    return <ErrorState message={error || undefined} />;
  }

  return (
    <div className="container max-w-6xl py-8 px-4 sm:px-6">
      <AppointmentHeader appointment={appointment} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery appointment={appointment} />
          
          <div className="space-y-8">
            <AppointmentSummaryCard appointment={appointment} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PropertyCard appointment={appointment} />
              <LocationCard appointment={appointment} />
            </div>
            
            {appointment.property && appointment.property.amenities.length > 0 && (
              <div className="bg-card border rounded-xl p-6">
                <PropertyAmenities appointment={appointment} />
              </div>
            )}
            
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Appointment Timeline</h3>
              <AppointmentTimeline appointment={appointment} />
            </div>
            
            <NotesCard appointment={appointment} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <QuickActionsCard appointment={appointment} />
            <PaymentStatusCard appointment={appointment} />
            <AgentCard appointment={appointment} />
            <AgencyCard appointment={appointment} />
            <BusinessHoursCard appointment={appointment} />
          </div>
        </div>
      </div>
    </div>
  );
}
