import { AgentConfig, ConversationMessage } from './types';

export class PromptBuilder {
  private agent: AgentConfig;
  private retrievedContext: string | null = null;

  constructor(agent: AgentConfig) {
    this.agent = agent;
  }

  setRetrievedContext(context: string) {
    this.retrievedContext = context;
    return this;
  }

  buildSystemPrompt(): string {
    const baseInstructions = `
You are a professional Real Estate AI Assistant. Your name is ${this.agent.name}.
Your primary language is ${this.agent.language}.
Your personality should be: ${this.agent.personality}.

CRITICAL RULES:
1. NEVER invent or hallucinate property information, prices, amenities, or availability.
2. ALWAYS use the provided function/tools to retrieve factual information from the database.
3. If the information is not found in the tools' responses, explicitly state that you could not find it.
4. Never guess prices.
5. Never invent availability slots.
6. You are strictly limited to the listings and services assigned to you. If a user asks about something outside your purview, politely decline and offer human assistance.
7. Ask follow-up questions to understand the user's needs better when necessary.
8. If you cannot help the user, offer human assistance or a way to leave a message.
    `.trim();

    let prompt = `${baseInstructions}\n\n`;

    if (this.agent.system_prompt) {
      prompt += `ADDITIONAL INSTRUCTIONS:\n${this.agent.system_prompt}\n\n`;
    }

    if (this.agent.assigned_listings.length > 0) {
      prompt += `NOTE: You have access to specific assigned listings. When you search, the system automatically filters to your assigned listings.\n\n`;
    }

    if (this.retrievedContext) {
      prompt += `INITIAL CONTEXT (Use this to answer queries without needing to search if relevant):\n${this.retrievedContext}\n\n`;
    }

    return prompt.trim();
  }

  buildMessages(history: ConversationMessage[], userMessage?: string): ConversationMessage[] {
    const messages = [...history];
    
    // Ensure system prompt is first and updated
    const systemPromptContent = this.buildSystemPrompt();
    const existingSystemIndex = messages.findIndex(m => m.role === 'system');
    
    if (existingSystemIndex >= 0) {
      messages[existingSystemIndex].content = systemPromptContent;
    } else {
      messages.unshift({
        id: crypto.randomUUID(),
        role: 'system',
        content: systemPromptContent,
      });
    }

    if (userMessage) {
      messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
      });
    }

    return messages;
  }
}
