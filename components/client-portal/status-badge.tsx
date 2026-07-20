import { Badge } from "@/components/ui/badge";
import { AppointmentStatus, PaymentStatus } from "@/types/client-portal";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    confirmed: { label: "Confirmed", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
    no_show: { label: "No Show", className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const statusConfig = {
    unpaid: { label: "Unpaid", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
    pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
    paid_cash: { label: "Paid (Cash)", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    paid_online: { label: "Paid (Online)", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    refunded: { label: "Refunded", className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
