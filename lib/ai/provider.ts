import OpenAI from 'openai';
import { AgentConfig, ConversationMessage, IAIProvider } from './types';

// We map our simplified roles to OpenAI's expected types.
type OpenAIRole = 'system' | 'user' | 'assistant' | 'tool';

export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(
    messages: ConversationMessage[],
    agentConfig: AgentConfig,
    tools?: any[]
  ): Promise<ConversationMessage> {
    const formattedMessages = messages.map((msg) => {
      const message: any = {
        role: msg.role as OpenAIRole,
        content: msg.content,
      };

      if (msg.name) {
        message.name = msg.name;
      }

      if (msg.tool_calls) {
        message.tool_calls = msg.tool_calls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: tc.arguments,
          },
        }));
      }

      if (msg.tool_call_id) {
        message.tool_call_id = msg.tool_call_id;
      }

      return message;
    });

    const completionOptions: any = {
      model: agentConfig.model || 'gpt-4o',
      messages: formattedMessages,
      temperature: agentConfig.temperature || 0.7,
      max_tokens: agentConfig.max_tokens || 1000,
    };

    if (tools && tools.length > 0) {
      completionOptions.tools = tools;
      completionOptions.tool_choice = 'auto';
    }

    const response = await this.client.chat.completions.create(completionOptions);

    const choice = response.choices[0];
    const message = choice.message;

    const resultMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: message.content,
    };

    if (message.tool_calls && message.tool_calls.length > 0) {
      resultMessage.tool_calls = message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }));
    }

    return resultMessage;
  }
}
