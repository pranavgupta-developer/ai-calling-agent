import { Suspense } from "react";
import { Bot } from "lucide-react";

import { getAgents } from "@/app/actions/ai-agent";
import { AgentListClient } from "@/components/dashboard/ai-agents/AgentListClient";
import { AgentLoadingSkeleton } from "@/components/dashboard/ai-agents/LoadingSkeleton";
import { ErrorState } from "@/components/dashboard/ai-agents/ErrorState";

export const metadata = {
  title: "AI Agents | Dashboard",
  description: "Configure and manage AI agents for your agency.",
};

export default async function AIAgentsPage() {
  const result = await getAgents();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Agents
          </h2>
          <p className="text-muted-foreground">
            Configure your AI agents to handle calls, answer questions, and assist your clients.
          </p>
        </div>
      </div>

      <Suspense fallback={<AgentLoadingSkeleton />}>
        {result.error ? (
          <ErrorState message={result.error} />
        ) : (
          <AgentListClient agents={result.data || []} />
        )}
      </Suspense>
    </div>
  );
}
