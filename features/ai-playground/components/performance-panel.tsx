'use client';

import { DeveloperLog } from '@/lib/ai/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Zap, Cpu } from 'lucide-react';

export function PerformancePanel({ metrics }: { metrics?: DeveloperLog }) {
  if (!metrics) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground border rounded-lg border-dashed">
        <p>No performance data available yet.</p>
      </div>
    );
  }

  const { latency, token_usage, model } = metrics;
  
  // Very rough cost estimation (e.g. gpt-4o pricing: $5 / 1M input, $15 / 1M output)
  let costEstimate = 0;
  if (model.includes('gpt-4o')) {
    costEstimate = (token_usage.prompt_tokens / 1_000_000) * 5.0 + (token_usage.completion_tokens / 1_000_000) * 15.0;
  } else if (model.includes('gpt-3.5') || model.includes('gpt-4o-mini')) {
    costEstimate = (token_usage.prompt_tokens / 1_000_000) * 0.15 + (token_usage.completion_tokens / 1_000_000) * 0.60;
  } else if (model.includes('gemini-1.5-pro')) {
    costEstimate = (token_usage.prompt_tokens / 1_000_000) * 3.50 + (token_usage.completion_tokens / 1_000_000) * 10.50;
  } else if (model.includes('gemini-1.5-flash')) {
    costEstimate = (token_usage.prompt_tokens / 1_000_000) * 0.35 + (token_usage.completion_tokens / 1_000_000) * 1.05;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latency.total_ms} ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            LLM: {latency.llm_ms}ms | Tools: {latency.tool_execution_ms}ms
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retrieval Time</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{latency.retrieval_ms || 0} ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            Vector DB search latency
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{token_usage.total_tokens}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {token_usage.prompt_tokens} in | {token_usage.completion_tokens} out
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Cost</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${costEstimate.toFixed(5)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {model} pricing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
