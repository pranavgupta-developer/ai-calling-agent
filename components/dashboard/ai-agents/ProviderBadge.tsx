import { Badge } from "@/components/ui/badge";
import { AgentProvider } from "@/types/ai-agent";

interface ProviderBadgeProps {
  provider: string | AgentProvider;
}

export function ProviderBadge({ provider }: ProviderBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-800";
  
  if (provider === AgentProvider.OPENAI || provider?.toLowerCase() === "openai") {
    colorClass = "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80";
  } else if (provider === AgentProvider.ANTHROPIC || provider?.toLowerCase() === "anthropic") {
    colorClass = "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
  } else if (provider === AgentProvider.GOOGLE || provider?.toLowerCase() === "google") {
    colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
  }

  return (
    <Badge variant="outline" className={colorClass}>
      {provider}
    </Badge>
  );
}
