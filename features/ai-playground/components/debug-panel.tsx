'use client';

import { TestMessage } from '../types/test-session';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DebugPanel({ messages }: { messages: TestMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground border rounded-lg border-dashed">
        <p>No messages to debug.</p>
      </div>
    );
  }

  // Find the last assistant message with a developer log
  const lastLog = messages.filter(m => m.developer_log).pop()?.developer_log;

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Full Conversation Payload</h3>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground font-mono">
            {JSON.stringify(messages.map(m => ({ role: m.role, content: m.content, name: m.name, tool_calls: m.tool_calls })), null, 2)}
          </pre>
        </div>

        {lastLog && (
          <div className="space-y-2">
            <h3 className="font-semibold">Latest Developer Log</h3>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground font-mono">
              {JSON.stringify(lastLog, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
