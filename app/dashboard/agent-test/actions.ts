'use server';

import { createClient } from '@/lib/supabase/server';
import { ConversationService } from '@/lib/ai/conversation';
import { ConversationMessage } from '@/lib/ai/types';

export async function processAgentMessage(
  agentId: string,
  messageContent: string,
  history: ConversationMessage[]
) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Verify the agent exists and belongs to the user's agency
    // (RLS handles this but we do it for an explicit check)
    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      throw new Error('Agent not found or unauthorized');
    }

    const conversationService = new ConversationService(supabase);
    const result = await conversationService.processMessage(agentId, messageContent, history);

    return {
      success: true,
      message: result.message,
      logs: result.logs,
    };
  } catch (error: any) {
    console.error('Error processing agent message:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
