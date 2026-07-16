import { SupabaseClient } from '@supabase/supabase-js';
import { getAgentConfig } from './agent';
import { buildSystemPrompt } from './prompts';
import { OpenAIProvider } from './provider';
import { GeminiProvider } from './gemini-provider';
import { globalToolRegistry } from './tools/index';
import { InMemoryConversationMemory } from './memory';
import { AgentConfig, ConversationMessage, IAIProvider } from './types';

export class ConversationService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async processMessage(
    agentId: string,
    messageContent: string,
    history: ConversationMessage[] = []
  ): Promise<{ message: ConversationMessage; logs: any }> {
    const startTime = Date.now();
    let toolExecutionTime = 0;
    let toolCallsCount = 0;
    const errors: string[] = [];

    // 1. Load Agent
    let agent: AgentConfig;
    try {
      agent = await getAgentConfig(this.supabase, agentId);
    } catch (error: any) {
      throw new Error(`Failed to load agent: ${error.message}`);
    }

    // 2. Initialize Memory
    const memory = new InMemoryConversationMemory(history);
    
    // Inject system prompt if not present
    const hasSystemPrompt = memory.getHistory().some((m) => m.role === 'system');
    if (!hasSystemPrompt) {
      memory.addMessage({
        id: crypto.randomUUID(),
        role: 'system',
        content: buildSystemPrompt(agent),
      });
    }

    // Add user message
    memory.addUserMessage(messageContent);

    const toolsConfig = globalToolRegistry.getOpenAIToolsFormat();

    let aiProvider: IAIProvider;
    if (agent.provider === 'Google') {
      aiProvider = new GeminiProvider();
    } else {
      aiProvider = new OpenAIProvider();
    }

    // 3. Provider Call Loop (Handling Tool Calls)
    let finalResponse: ConversationMessage | null = null;
    let isProcessing = true;

    while (isProcessing) {
      const currentHistory = memory.getHistory();
      
      try {
        const aiResponse = await aiProvider.chat(currentHistory, agent, toolsConfig);
        
        // Assistant Message (with or without tool calls)
        memory.addMessage(aiResponse);

        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
          toolCallsCount += aiResponse.tool_calls.length;
          const toolStartTime = Date.now();

          // 4. Execute Tools (In Parallel)
          const toolPromises = aiResponse.tool_calls.map(async (tc) => {
            const result = await globalToolRegistry.executeTool(tc.name, tc.arguments, {
              supabase: this.supabase,
              agent,
            });

            return {
              toolCallId: tc.id,
              name: tc.name,
              content: typeof result === 'string' ? result : JSON.stringify(result),
            };
          });

          const toolResults = await Promise.all(toolPromises);
          
          toolExecutionTime += Date.now() - toolStartTime;

          // Add Tool Results to memory
          toolResults.forEach((tr) => {
            memory.addToolMessage(tr.toolCallId, tr.name, tr.content);
          });

          // Loop continues to let the LLM generate the final answer with the tool results
        } else {
          finalResponse = aiResponse;
          isProcessing = false; // No more tool calls, we are done
        }
      } catch (error: any) {
        console.error("AI Provider Error:", error);
        errors.push(error.message);
        isProcessing = false;
        throw new Error(`AI Provider Error: ${error.message}`);
      }
    }

    const responseTimeMs = Date.now() - startTime;

    const logs = {
      conversation_id: 'pending', // would be passed in a real db-backed memory
      agency_id: agent.agency_id,
      agent_id: agent.id,
      tool_calls: toolCallsCount,
      tool_execution_time_ms: toolExecutionTime,
      response_time_ms: responseTimeMs,
      prompt_tokens: 0, // Not explicitly tracked in this basic implementation without token counting logic, but can be extracted from OpenAI response metadata if needed
      completion_tokens: 0,
      total_tokens: 0,
      errors: errors.length > 0 ? errors.join(', ') : null,
      timestamp: new Date().toISOString(),
    };

    // Fire and forget logging
    console.log('[Conversation Log]', JSON.stringify(logs, null, 2));

    return {
      message: finalResponse!,
      logs,
    };
  }
}
