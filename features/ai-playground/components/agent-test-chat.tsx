'use client';

import { useState, useRef, useEffect } from 'react';
import { AIAgent } from '@/types/ai-agent';
import { TestMessage } from '../types/test-session';
import { sendPlaygroundMessage } from '../actions/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, User, Bot, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export function AgentTestChat({
  agent,
  messages,
  setMessages,
  isProcessing,
  setIsProcessing,
  pendingScenario,
  onScenarioHandled,
}: {
  agent: AIAgent;
  messages: TestMessage[];
  setMessages: (messages: TestMessage[] | ((prev: TestMessage[]) => TestMessage[])) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  pendingScenario?: TestMessage | null;
  onScenarioHandled?: () => void;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (pendingScenario && !isProcessing) {
      setInput(pendingScenario.content || '');
      // Auto-send can be implemented here by calling handleSend if needed
      // But for now just populate the input
      if (onScenarioHandled) onScenarioHandled();
    }
  }, [pendingScenario, isProcessing, onScenarioHandled]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: TestMessage = {
      id: crypto.randomUUID(),
      session_id: 'pending',
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Map TestMessage to ConversationMessage
      const history = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        name: m.name,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id
      }));

      const response = await sendPlaygroundMessage(agent.id, userMessage.content || '', history);

      if (response.success && response.message) {
        const aiMessage: TestMessage = {
          id: response.message.id || crypto.randomUUID(),
          session_id: 'pending',
          role: response.message.role,
          content: response.message.content,
          tool_calls: response.message.tool_calls,
          developer_log: response.logs,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Send a message to start the test session.
          </div>
        )}
        
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isTool = msg.role === 'tool';
          
          if (isTool) {
            return (
              <div key={index} className="flex flex-col items-center my-2">
                <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  Tool execution: {msg.name}
                </div>
              </div>
            );
          }

          return (
            <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {msg.tool_calls.map((tc, i) => (
                      <div key={i} className="text-xs bg-background/20 rounded p-1">
                        🛠 {tc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center rounded-lg bg-muted px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="min-h-[60px] resize-none pr-12 text-sm"
            disabled={isProcessing}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
