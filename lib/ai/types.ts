import { AIAgent } from '@/types/ai-agent';

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string
}

export interface ConversationMessage {
  id: string;
  role: Role;
  content: string | null;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string; // used when role === 'tool'
}

export interface ToolResult {
  toolCallId: string;
  result: any;
}

export interface AgentConfig extends AIAgent {
  assigned_listings: string[]; // Array of listing IDs
  assigned_services: string[]; // Array of service IDs
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LatencyMetrics {
  retrieval_ms: number;
  tool_execution_ms: number;
  llm_ms: number;
  total_ms: number;
}

export interface ToolExecutionLog {
  id: string;
  name: string;
  arguments: any; // parsed arguments
  result: any;
  execution_time_ms: number;
  status: 'success' | 'error';
  error?: string;
}

export interface ProviderResponse {
  message: ConversationMessage;
  usage?: TokenUsage;
}

export interface IAIProvider {
  chat(
    messages: ConversationMessage[],
    agentConfig: AgentConfig,
    tools?: any[]
  ): Promise<ProviderResponse>;
}

export interface DeveloperLog {
  conversation_id: string;
  agency_id: string;
  agent_id: string;
  model: string;
  token_usage: TokenUsage;
  latency: LatencyMetrics;
  tool_executions: ToolExecutionLog[];
  errors: string[];
  timestamp: string;
}

