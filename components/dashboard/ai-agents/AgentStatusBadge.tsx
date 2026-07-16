import { Badge } from "@/components/ui/badge";

interface AgentStatusBadgeProps {
  isActive: boolean;
}

export function AgentStatusBadge({ isActive }: AgentStatusBadgeProps) {
  return (
    <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-800 hover:bg-green-100/80" : ""}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
