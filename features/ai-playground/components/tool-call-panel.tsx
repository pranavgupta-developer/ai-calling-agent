'use client';

import { ToolExecutionLog } from '@/lib/ai/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export function ToolCallPanel({ toolExecutions }: { toolExecutions: ToolExecutionLog[] }) {
  if (!toolExecutions || toolExecutions.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground border rounded-lg border-dashed">
        <p>No tools have been executed in this session.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 space-y-4">
        {toolExecutions.map((log, index) => (
          <div key={`${log.id}-${index}`} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{log.name}</span>
                {log.status === 'success' ? (
                  <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive bg-destructive/10">
                    <XCircle className="w-3 h-3 mr-1" /> Failed
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {log.execution_time_ms}ms
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arguments</div>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground">
                {JSON.stringify(log.arguments, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result</div>
              <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground">
                {log.error ? log.error : JSON.stringify(log.result, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
