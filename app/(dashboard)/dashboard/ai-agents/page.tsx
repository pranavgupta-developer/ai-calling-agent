import { Bot, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AIAgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI calling agents, manage voice settings, and review
            call transcripts.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create Agent
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <Bot className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No AI agents configured</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your first AI agent to start automating lead qualification
          calls.
        </p>
        <Button className="mt-6 gap-2" variant="outline">
          <Plus className="size-4" />
          Create Agent
        </Button>
      </div>
    </div>
  );
}
