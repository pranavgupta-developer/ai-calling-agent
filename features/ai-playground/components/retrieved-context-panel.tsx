'use client';

import { ToolExecutionLog } from '@/lib/ai/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Database } from 'lucide-react';

export function RetrievedContextPanel({ toolExecutions }: { toolExecutions: ToolExecutionLog[] }) {
  // Filter only retrieval-related tools
  const retrievalLogs = toolExecutions.filter(
    (log) => log.name === 'search_knowledge_base' || log.name === 'search_properties' || log.name === 'get_property_details' || log.name === 'search_services'
  );

  if (!retrievalLogs || retrievalLogs.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground border rounded-lg border-dashed">
        <p>No knowledge base or property context was retrieved in this session.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 space-y-4">
        {retrievalLogs.map((log, index) => {
          let items: any[] = [];
          if (Array.isArray(log.result)) {
            items = log.result;
          } else if (log.result?.data && Array.isArray(log.result.data)) {
            items = log.result.data;
          } else if (log.result && typeof log.result === 'object') {
            items = [log.result];
          }

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b">
                <Database className="w-4 h-4" />
                Query via {log.name}: <span className="text-foreground">"{log.arguments?.query || log.arguments?.id || 'all'}"</span>
              </div>
              
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">No results found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item, i) => (
                    <div key={i} className="border rounded-md p-3 bg-card/50 text-sm">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="w-4 h-4 mt-0.5 text-primary" />
                        <div className="flex-1 font-medium">{item.title || item.name || 'Document'}</div>
                        {item.similarity !== undefined && (
                          <div className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            Score: {(item.similarity * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs leading-relaxed line-clamp-4 pl-6">
                        {item.content || item.description || JSON.stringify(item)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
