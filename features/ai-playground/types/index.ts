import { ConversationMessage, DeveloperLog } from '@/lib/ai/types';

export interface PlaygroundState {
  agentId: string | null;
  modelId: string;
  temperature: number;
  isProcessing: boolean;
  history: ConversationMessage[];
  developerLog: DeveloperLog | null;
  retrievedContext?: any;
}
