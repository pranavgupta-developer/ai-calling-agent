import { MessageSquareText } from "lucide-react";

export default function ClientMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Communicate with your agent and receive property updates.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20">
        <MessageSquareText className="size-12 text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-semibold">No messages yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages from your agent and AI assistant will appear here.
        </p>
      </div>
    </div>
  );
}
