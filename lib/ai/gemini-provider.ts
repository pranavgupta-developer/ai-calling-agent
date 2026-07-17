import { GoogleGenAI, Content, Part } from '@google/genai';
import { AgentConfig, ConversationMessage, IAIProvider, ProviderResponse } from './types';

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async chat(
    messages: ConversationMessage[],
    agentConfig: AgentConfig,
    tools?: any[]
  ): Promise<ProviderResponse> {
    
    let systemInstruction = '';
    const geminiContents: Content[] = [];

    // Map conversation messages to Gemini format
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction += msg.content + '\n';
        continue;
      }

      let role = 'user';
      if (msg.role === 'assistant') {
        role = 'model';
      }

      const parts: Part[] = [];

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // If the assistant made a tool call
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          parts.push({
            functionCall: {
              name: tc.name,
              args: JSON.parse(tc.arguments),
            }
          });
        }
      }

      // If this is a tool result
      if (msg.role === 'tool') {
        // Gemini expects role to be 'user' for function responses
        role = 'user'; 
        
        // Parse the content, ensure it's a valid object
        let parsedResponse = {};
        try {
          parsedResponse = JSON.parse(msg.content || '{}');
        } catch (e) {
          parsedResponse = { error: msg.content };
        }

        parts.push({
          functionResponse: {
            name: msg.name!,
            response: parsedResponse,
          }
        });
      }

      geminiContents.push({ role, parts });
    }

    // Map OpenAI style tools to Gemini FunctionDeclarations
    let geminiTools: any[] | undefined = undefined;
    if (tools && tools.length > 0) {
      geminiTools = [{
        functionDeclarations: tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        }))
      }];
    }

    const config: any = {
      temperature: agentConfig.temperature || 0.7,
      maxOutputTokens: agentConfig.max_tokens || 1000,
    };

    if (systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }
    
    if (geminiTools) {
      config.tools = geminiTools;
    }

    const modelName = agentConfig.model && agentConfig.model.includes('gemini') 
      ? agentConfig.model 
      : 'gemini-2.5-flash';

    const response = await this.client.models.generateContent({
      model: modelName,
      contents: geminiContents,
      config: config
    });

    const resultMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.text || null,
    };

    // Extract function calls from Gemini's response
    if (response.functionCalls && response.functionCalls.length > 0) {
      resultMessage.tool_calls = response.functionCalls.map((fc: any) => ({
        id: crypto.randomUUID(), // Gemini doesn't return tool call IDs natively like OpenAI, so we generate them
        name: fc.name,
        arguments: JSON.stringify(fc.args),
      }));
    }

    return {
      message: resultMessage,
      usage: response.usageMetadata ? {
        prompt_tokens: response.usageMetadata.promptTokenCount || 0,
        completion_tokens: response.usageMetadata.candidatesTokenCount || 0,
        total_tokens: response.usageMetadata.totalTokenCount || 0,
      } : undefined
    };
  }
}

