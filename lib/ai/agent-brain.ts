import { SupabaseClient } from '@supabase/supabase-js';
import { PromptBuilder } from './prompt-builder';
import { OpenAIProvider } from './provider';
import { GeminiProvider } from './gemini-provider';
import { globalToolRegistry } from './tools/index';
import { InMemoryConversationMemory } from './memory';
import {
  AgentConfig,
  ConversationMessage,
  IAIProvider,
  DeveloperLog,
  LatencyMetrics,
  TokenUsage,
  ToolExecutionLog,
} from './types';

export interface AgentBrainOptions {
  agent: AgentConfig;
  supabase: SupabaseClient;
  history: ConversationMessage[];
  retrievedContext?: string;
}

export class AgentBrain {
  private agent: AgentConfig;
  private supabase: SupabaseClient;
  private memory: InMemoryConversationMemory;
  private aiProvider: IAIProvider;
  private promptBuilder: PromptBuilder;

  private toolExecutions: ToolExecutionLog[] = [];
  private tokenUsage: TokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  private latencies: LatencyMetrics = { retrieval_ms: 0, tool_execution_ms: 0, llm_ms: 0, total_ms: 0 };
  private errors: string[] = [];
  private totalStartTime: number;

  constructor(options: AgentBrainOptions) {
    this.totalStartTime = Date.now();
    this.agent = options.agent;
    this.supabase = options.supabase;
    this.memory = new InMemoryConversationMemory(options.history);
    
    this.promptBuilder = new PromptBuilder(this.agent);
    if (options.retrievedContext) {
      this.promptBuilder.setRetrievedContext(options.retrievedContext);
    }

    if (this.agent.provider === 'Google') {
      this.aiProvider = new GeminiProvider();
    } else {
      this.aiProvider = new OpenAIProvider();
    }
  }

  async processMessage(userMessage?: string): Promise<{
    message: ConversationMessage;
    developerLog: DeveloperLog;
  }> {
    // 1. Build messages with PromptBuilder
    const initialMessages = this.promptBuilder.buildMessages(this.memory.getHistory(), userMessage);
    
    // Replace memory with the properly structured initial messages
    this.memory = new InMemoryConversationMemory(initialMessages);

    const toolsConfig = globalToolRegistry.getOpenAIToolsFormat();

    let finalResponse: ConversationMessage | null = null;
    let isProcessing = true;

    // 2. Provider Call Loop
    while (isProcessing) {
      const currentHistory = this.memory.getHistory();
      
      try {
        const llmStartTime = Date.now();
        const aiResponse = await this.aiProvider.chat(currentHistory, this.agent, toolsConfig);
        this.latencies.llm_ms += Date.now() - llmStartTime;

        if (aiResponse.usage) {
          this.tokenUsage.prompt_tokens += aiResponse.usage.prompt_tokens;
          this.tokenUsage.completion_tokens += aiResponse.usage.completion_tokens;
          this.tokenUsage.total_tokens += aiResponse.usage.total_tokens;
        }
        
        // Assistant Message (with or without tool calls)
        this.memory.addMessage(aiResponse.message);

        if (aiResponse.message.tool_calls && aiResponse.message.tool_calls.length > 0) {
          const toolStartTime = Date.now();

          // 3. Execute Tools (In Parallel)
          const toolPromises = aiResponse.message.tool_calls.map(async (tc) => {
            const execStartTime = Date.now();
            let result;
            let status: 'success' | 'error' = 'success';
            let errorMessage: string | undefined = undefined;

            try {
              result = await globalToolRegistry.executeTool(tc.name, tc.arguments, {
                supabase: this.supabase,
                agent: this.agent,
              });
              if (result?.error) {
                status = 'error';
                errorMessage = result.error;
              }
            } catch (err: any) {
              status = 'error';
              errorMessage = err.message;
              result = { error: errorMessage };
            }

            const execTime = Date.now() - execStartTime;

            // Log execution
            this.toolExecutions.push({
              id: tc.id,
              name: tc.name,
              arguments: JSON.parse(tc.arguments || '{}'),
              result,
              execution_time_ms: execTime,
              status,
              error: errorMessage,
            });

            return {
              toolCallId: tc.id,
              name: tc.name,
              content: typeof result === 'string' ? result : JSON.stringify(result),
            };
          });

          const toolResults = await Promise.all(toolPromises);
          this.latencies.tool_execution_ms += Date.now() - toolStartTime;

          // Add Tool Results to memory
          toolResults.forEach((tr) => {
            this.memory.addToolMessage(tr.toolCallId, tr.name, tr.content);
          });

          // Loop continues to let the LLM generate the final answer with the tool results
        } else {
          finalResponse = aiResponse.message;
          isProcessing = false; // No more tool calls, we are done
        }
      } catch (error: any) {
        console.error("AI Provider Error:", error);
        this.errors.push(error.message);
        isProcessing = false;
        throw new Error(`AI Provider Error: ${error.message}`);
      }
    }

    this.latencies.total_ms = Date.now() - this.totalStartTime;

    const developerLog: DeveloperLog = {
      conversation_id: 'pending', // Usually passed from above
      agency_id: this.agent.agency_id,
      agent_id: this.agent.id,
      model: this.agent.model || 'gpt-4o',
      token_usage: this.tokenUsage,
      latency: this.latencies,
      tool_executions: this.toolExecutions,
      errors: this.errors,
      timestamp: new Date().toISOString(),
    };

    return {
      message: finalResponse!,
      developerLog,
    };
  }
}
