'use client';

import { useState, useRef, useEffect } from 'react';
import { ConversationMessage } from '@/lib/ai/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Copy } from 'lucide-react';

interface ChatInterfaceProps {
  history: ConversationMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export function ChatInterface({ history, onSendMessage, isProcessing }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleCopy = (text: string | null) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const visibleMessages = history.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <Card className="flex flex-col h-full border-muted/60 shadow-md">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Conversation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
          {visibleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 pt-12">
              <Bot className="h-12 w-12 opacity-20" />
              <p>Send a message to start testing the agent.</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {visibleMessages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      }`}
                    >
                      {/* Simple rendering for now, could add React Markdown later */}
                      {msg.content ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="flex items-center text-xs text-muted-foreground italic gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Calling Tools...
                        </div>
                      )}
                    </div>
                    
                    {msg.role === 'assistant' && msg.content && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(msg.content)}
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-2 text-sm">
                    <span className="flex space-x-1">
                      <span className="animate-bounce delay-75">.</span>
                      <span className="animate-bounce delay-150">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isProcessing}>
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
