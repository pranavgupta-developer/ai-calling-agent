import { Badge } from "@/components/ui/badge";
import { PropertyStatus } from "@/types/property";

interface StatusBadgeProps {
  status: PropertyStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "available";

  switch (normalizedStatus) {
    case "available":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
          Available
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
          Pending
        </Badge>
      );
    case "sold":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20">
          Sold
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
}
