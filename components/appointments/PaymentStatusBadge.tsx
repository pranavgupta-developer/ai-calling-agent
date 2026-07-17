import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/appointments";

const paymentConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  unpaid: { label: "Unpaid", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
  paid_cash: { label: "Paid (Cash)", variant: "success" },
  paid_online: { label: "Paid (Online)", variant: "success" },
  refunded: { label: "Refunded", variant: "secondary" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status] || { label: status, variant: "outline" };
  
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
