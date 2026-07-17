import { DeveloperLog } from '@/lib/ai/types';

export interface TestSession {
  id: string;
  agency_id: string;
  agent_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TestMessage {
  id: string;
  session_id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
  developer_log?: DeveloperLog;
  created_at: string;
}
