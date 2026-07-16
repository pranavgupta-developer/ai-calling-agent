import { ConversationMessage, ToolCall } from './types';

export interface IConversationMemory {
  addMessage(message: ConversationMessage): void;
  getHistory(): ConversationMessage[];
  clear(): void;
  addUserMessage(content: string): void;
  addAssistantMessage(content: string | null, toolCalls?: ToolCall[]): void;
  addToolMessage(toolCallId: string, name: string, content: string): void;
}

export class InMemoryConversationMemory implements IConversationMemory {
  private messages: ConversationMessage[] = [];

  constructor(initialMessages: ConversationMessage[] = []) {
    this.messages = initialMessages;
  }

  addMessage(message: ConversationMessage): void {
    this.messages.push(message);
  }

  getHistory(): ConversationMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  addUserMessage(content: string): void {
    this.addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content,
    });
  }

  addAssistantMessage(content: string | null, toolCalls?: ToolCall[]): void {
    this.addMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      tool_calls: toolCalls,
    });
  }

  addToolMessage(toolCallId: string, name: string, content: string): void {
    this.addMessage({
      id: crypto.randomUUID(),
      role: 'tool',
      content,
      name,
      tool_call_id: toolCallId,
    });
  }
}
