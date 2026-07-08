import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload documents, FAQs, and property details to train your AI
            agents.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Document
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <BookOpen className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">
          Knowledge base is empty
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add documents and FAQs so your AI agents can answer property questions
          accurately.
        </p>
        <Button className="mt-6 gap-2" variant="outline">
          <Plus className="size-4" />
          Add Document
        </Button>
      </div>
    </div>
  );
}
