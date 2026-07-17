'use server';

import { createClient } from '@/lib/supabase/server';
import { ConversationService } from '@/lib/ai/conversation';
import { ConversationMessage, DeveloperLog } from '@/lib/ai/types';

export async function sendPlaygroundMessage(
  agentId: string,
  messageContent: string,
  history: ConversationMessage[] = []
): Promise<{ success: boolean; message?: ConversationMessage; logs?: DeveloperLog; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Validate auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Initialize the conversation service
    const conversationService = new ConversationService(supabase);

    // Process the message
    const result = await conversationService.processMessage(agentId, messageContent, history);

    return {
      success: true,
      message: result.message,
      logs: result.logs,
    };
  } catch (error: any) {
    console.error('Playground chat error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during the conversation.',
    };
  }
}
