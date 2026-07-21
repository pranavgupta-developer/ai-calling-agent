import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types/client-portal";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
    confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 hover:bg-green-200" },
    completed: { label: "Completed", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 hover:bg-red-200" },
    no_show: { label: "No Show", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <Badge variant="outline" className={`border-none ${config.className}`}>
      {config.label}
    </Badge>
  );
}
