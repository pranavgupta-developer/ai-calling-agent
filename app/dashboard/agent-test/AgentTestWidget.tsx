'use client';

import { useState, useRef, useEffect } from 'react';
import { processAgentMessage } from './actions';
import { ConversationMessage } from '@/lib/ai/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentTestWidget({ agents }: { agents: { id: string; name: string }[] }) {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.id || '');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestLogs, setLatestLogs] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processAgentMessage(selectedAgent, userMessage.content || '', messages);
      
      if (response.success && response.message) {
        setMessages((prev) => [...prev, response.message as ConversationMessage]);
        setLatestLogs(response.logs);
      } else {
        toast.error(response.error || 'Failed to get response from AI');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setLatestLogs(null);
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Left Panel: Chat Interface */}
      <div className="flex w-full flex-col border-r md:w-2/3">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex w-[300px] items-center gap-4">
            <span className="text-sm font-medium">Select Agent:</span>
            <Select value={selectedAgent} onValueChange={(v) => v && setSelectedAgent(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={handleClear}>Clear Chat</Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Send a message to start the conversation.
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={msg.id || i}
                className={`flex flex-col max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start bg-muted text-foreground'
                }`}
              >
                <span className="text-xs font-semibold opacity-70 mb-1 capitalize">
                  {msg.role}
                </span>
                <span className="whitespace-pre-wrap text-sm">{msg.content}</span>
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mt-2 text-xs opacity-70 border-t border-primary-foreground/20 pt-2">
                    Used Tools: {msg.tool_calls.map((t) => t.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-muted text-foreground rounded-lg p-3 max-w-[80%]">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !selectedAgent}
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !selectedAgent}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel: Inspector & Logs */}
      <div className="flex w-full flex-col bg-muted/20 p-4 md:w-1/3 overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Inspector</h2>
        {latestLogs ? (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Execution Metadata</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Response Time:</div>
                  <div className="font-medium">{latestLogs.response_time_ms}ms</div>
                  
                  <div className="text-muted-foreground">Tools Executed:</div>
                  <div className="font-medium">{latestLogs.tool_calls}</div>
                  
                  <div className="text-muted-foreground">Tool Time:</div>
                  <div className="font-medium">{latestLogs.tool_execution_time_ms}ms</div>
                  
                  <div className="text-muted-foreground">Tokens:</div>
                  <div className="font-medium">{latestLogs.total_tokens || 'N/A'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Raw Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(latestLogs, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No logs available. Send a message to see metadata.
          </div>
        )}
      </div>
    </div>
  );
}
