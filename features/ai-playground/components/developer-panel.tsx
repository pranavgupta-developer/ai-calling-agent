'use client';

import { useState } from 'react';
import { DeveloperLog, ConversationMessage } from '@/lib/ai/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Terminal, Database, Clock, Activity, AlertCircle, Wrench } from 'lucide-react';

interface DeveloperPanelProps {
  log: DeveloperLog | null;
  history: ConversationMessage[];
}

type TabType = 'timeline' | 'tools' | 'performance' | 'raw';

export function DeveloperPanel({ log, history }: DeveloperPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  if (!log) {
    return (
      <Card className="h-full border-muted/60 shadow-md">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            Developer Panel
          </CardTitle>
          <CardDescription>Metrics will appear here after a conversation.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-80px)] text-muted-foreground">
          Waiting for execution data...
        </CardContent>
      </Card>
    );
  }

  const systemPrompt = history.find(m => m.role === 'system')?.content || 'No system prompt found.';

  return (
    <Card className="flex flex-col h-full border-muted/60 shadow-md">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Developer Logs
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {log.model}
          </Badge>
        </CardTitle>
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          <Button 
            variant={activeTab === 'timeline' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('timeline')}
            className="text-xs h-8"
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" /> Timeline
          </Button>
          <Button 
            variant={activeTab === 'tools' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('tools')}
            className="text-xs h-8"
          >
            <Wrench className="h-3.5 w-3.5 mr-1.5" /> Tools ({log.tool_executions.length})
          </Button>
          <Button 
            variant={activeTab === 'performance' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('performance')}
            className="text-xs h-8"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Performance
          </Button>
          <Button 
            variant={activeTab === 'raw' ? 'default' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('raw')}
            className="text-xs h-8"
          >
            <Database className="h-3.5 w-3.5 mr-1.5" /> Prompt Preview
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/20">
        <ScrollArea className="h-full px-4 py-4">
          
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {log.errors.length > 0 && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4 border border-destructive/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4" /> Errors
                  </div>
                  <ul className="list-disc pl-5">
                    {log.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Execution Flow</h3>
                
                <div className="relative pl-4 border-l-2 border-primary/20 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary/40" />
                    <p className="text-sm font-medium">Prompt Building</p>
                    <p className="text-xs text-muted-foreground mt-1">Assembled system context and history.</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary/40" />
                    <p className="text-sm font-medium">LLM Request</p>
                    <p className="text-xs text-muted-foreground mt-1">Sent to {log.model}</p>
                  </div>
                  
                  {log.tool_executions.map((tc, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-secondary" />
                      <p className="text-sm font-medium">Tool Call: {tc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Duration: {tc.execution_time_ms}ms</p>
                    </div>
                  ))}

                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary/80" />
                    <p className="text-sm font-medium">Response Generation</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Time: {log.latency.total_ms}ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              {log.tool_executions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No tools executed in this turn.</p>
              ) : (
                log.tool_executions.map((tool, idx) => (
                  <Card key={tool.id || idx} className="shadow-none border-muted">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-mono flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5" /> {tool.name}
                        </CardTitle>
                        <Badge variant={tool.status === 'success' ? 'secondary' : 'destructive'} className="text-[10px]">
                          {tool.execution_time_ms}ms
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Arguments</span>
                        <pre className="mt-1 bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto">
                          {JSON.stringify(tool.arguments, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Result</span>
                        <pre className="mt-1 bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
                          {tool.error || JSON.stringify(tool.result, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Latency Breakdown</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-background rounded-md border text-center">
                    <p className="text-xs text-muted-foreground mb-1">LLM Time</p>
                    <p className="text-lg font-mono font-medium">{log.latency.llm_ms}ms</p>
                  </div>
                  <div className="p-3 bg-background rounded-md border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Tools Time</p>
                    <p className="text-lg font-mono font-medium">{log.latency.tool_execution_ms}ms</p>
                  </div>
                  <div className="col-span-2 p-3 bg-primary/5 rounded-md border border-primary/20 text-center">
                    <p className="text-xs text-primary/80 mb-1">Total Time</p>
                    <p className="text-xl font-mono font-bold text-primary">{log.latency.total_ms}ms</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Token Usage</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-background rounded-md border text-center">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase">Prompt</p>
                    <p className="text-sm font-mono">{log.token_usage.prompt_tokens}</p>
                  </div>
                  <div className="p-2 bg-background rounded-md border text-center">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase">Completion</p>
                    <p className="text-sm font-mono">{log.token_usage.completion_tokens}</p>
                  </div>
                  <div className="p-2 bg-secondary/20 rounded-md border border-secondary/30 text-center">
                    <p className="text-[10px] text-secondary-foreground mb-1 uppercase font-semibold">Total</p>
                    <p className="text-sm font-mono font-bold">{log.token_usage.total_tokens}</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-right">
                  *Tokens may be 0 if the provider does not support tracking yet.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assembled System Prompt</h3>
              <pre className="bg-muted p-3 rounded-md text-xs font-mono whitespace-pre-wrap">
                {systemPrompt}
              </pre>
            </div>
          )}

        </ScrollArea>
      </CardContent>
    </Card>
  );
}
