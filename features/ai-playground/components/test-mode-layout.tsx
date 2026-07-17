'use client';

import { useState } from 'react';
import { AIAgent } from '@/types/ai-agent';
import { TestMessage } from '../types/test-session';
import { AgentTestChat } from './agent-test-chat';
import { ToolCallPanel } from './tool-call-panel';
import { PerformancePanel } from './performance-panel';
import { RetrievedContextPanel } from './retrieved-context-panel';
import { AgentInfoCard } from './agent-info-card';
import { DebugPanel } from './debug-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionToolbar } from './session-toolbar';

export function TestModeLayout({ agent }: { agent: AIAgent }) {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingScenario, setPendingScenario] = useState<TestMessage | null>(null);

  // Derive developer logs and metrics from messages
  const allToolExecutions = messages
    .filter((m) => m.developer_log)
    .flatMap((m) => m.developer_log!.tool_executions || []);
    
  const latestPerformance = messages
    .filter((m) => m.developer_log)
    .map((m) => m.developer_log!)
    .pop();

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 px-6 pb-6">
      {/* Left Column: Chat */}
      <div className="flex w-1/2 flex-col rounded-xl border bg-card text-card-foreground shadow">
        <div className="border-b p-4">
          <SessionToolbar 
            agent={agent}
            messages={messages}
            sessionId={sessionId}
            onSessionLoaded={(id, loadedMsgs) => {
              setSessionId(id);
              setMessages(loadedMsgs);
            }}
            onClear={() => {
              setSessionId(null);
              setMessages([]);
            }}
            onScenarioSelect={setPendingScenario}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <AgentTestChat
            agent={agent}
            messages={messages}
            setMessages={setMessages}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            pendingScenario={pendingScenario}
            onScenarioHandled={() => setPendingScenario(null)}
          />
        </div>
      </div>

      {/* Right Column: Inspector Panels */}
      <div className="flex w-1/2 flex-col gap-4 overflow-y-auto pr-2">
        <AgentInfoCard agent={agent} />

        <Tabs defaultValue="tools" className="w-full flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
          <TabsContent value="tools" className="mt-4">
            <ToolCallPanel toolExecutions={allToolExecutions} />
          </TabsContent>
          <TabsContent value="context" className="mt-4">
            <RetrievedContextPanel toolExecutions={allToolExecutions} />
          </TabsContent>
          <TabsContent value="performance" className="mt-4">
            <PerformancePanel metrics={latestPerformance} />
          </TabsContent>
          <TabsContent value="debug" className="mt-4">
            <DebugPanel messages={messages} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
