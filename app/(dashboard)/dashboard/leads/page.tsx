import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your incoming leads, assign agents, and monitor
            qualification status.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Lead
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <Users className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No leads yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Leads will appear here once your AI agents start qualifying callers.
        </p>
      </div>
    </div>
  );
}
