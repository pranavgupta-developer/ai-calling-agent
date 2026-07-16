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

export interface IAIProvider {
  chat(
    messages: ConversationMessage[],
    agentConfig: AgentConfig,
    tools?: any[]
  ): Promise<ConversationMessage>;
}

export interface ConversationLog {
  conversation_id: string;
  agency_id: string;
  agent_id: string;
  tool_calls: number;
  tool_execution_time_ms: number;
  response_time_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  errors: string | null;
  timestamp: string;
}
