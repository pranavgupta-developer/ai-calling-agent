import { getServices } from "@/lib/actions/services/get-services";
import { ServicesClient } from "@/components/dashboard/services/services-client";

export const metadata = {
  title: "Services | Real Estate Dashboard",
  description: "Manage your agency's real estate services",
};

export default async function ServicesPage() {
  const { data: services, error } = await getServices();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-bold text-destructive">Error Loading Services</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <ServicesClient initialServices={services || []} />
    </div>
  );
}
