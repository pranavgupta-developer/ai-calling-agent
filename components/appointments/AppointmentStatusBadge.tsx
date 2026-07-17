import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types/appointments";

const statusConfig: Record<AppointmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  no_show: { label: "No Show", variant: "secondary" },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = statusConfig[status] || { label: status, variant: "outline" };
  
  // Note: Assuming "success" and "warning" are added to your badge variants, 
  // otherwise fallback to default/secondary for now in standard shadcn.
  // We map custom variants to standard if they don't exist.
  const standardVariant = ["default", "secondary", "destructive", "outline"].includes(config.variant) 
    ? (config.variant as "default" | "secondary" | "destructive" | "outline")
    : "outline"; // fallback

  const customStyle = config.variant === "success" 
    ? "bg-green-100 text-green-800 hover:bg-green-100" 
    : config.variant === "warning" 
    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" 
    : "";

  return (
    <Badge variant={standardVariant} className={customStyle}>
      {config.label}
    </Badge>
  );
}
