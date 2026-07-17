import { SupabaseClient } from '@supabase/supabase-js';
import { getAgentConfig } from './agent';
import { AgentBrain } from './agent-brain';
import { ConversationMessage, DeveloperLog } from './types';

export class ConversationService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async processMessage(
    agentId: string,
    messageContent: string,
    history: ConversationMessage[] = []
  ): Promise<{ message: ConversationMessage; logs: DeveloperLog }> {
    
    // 1. Load Agent
    let agent;
    try {
      agent = await getAgentConfig(this.supabase, agentId);
    } catch (error: any) {
      throw new Error(`Failed to load agent: ${error.message}`);
    }

    // 2. Initialize Agent Brain
    const brain = new AgentBrain({
      agent,
      supabase: this.supabase,
      history,
    });

    // 3. Process Message
    const { message, developerLog } = await brain.processMessage(messageContent);
    
    // You could save logs to DB here if needed
    // console.log('[Conversation Log]', JSON.stringify(developerLog, null, 2));

    return {
      message,
      logs: developerLog,
    };
  }
}

