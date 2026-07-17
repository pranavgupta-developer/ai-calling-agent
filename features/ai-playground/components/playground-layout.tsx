'use client';

import { useState } from 'react';
import { AIAgent } from '@/types/ai-agent';
import { ConversationMessage, DeveloperLog } from '@/lib/ai/types';
import { sendPlaygroundMessage } from '../actions/chat';
import { ChatInterface } from './chat-interface';
import { DeveloperPanel } from './developer-panel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Settings2, Play } from 'lucide-react';

interface PlaygroundLayoutProps {
  agents: AIAgent[];
}

export function PlaygroundLayout({ agents }: PlaygroundLayoutProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [log, setLog] = useState<DeveloperLog | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<string>('default');

  const handleSendMessage = async (content: string) => {
    if (!selectedAgentId) {
      toast.error('Please select an agent first.');
      return;
    }

    setIsProcessing(true);
    const newHistory = [...history, { id: crypto.randomUUID(), role: 'user' as const, content }];
    setHistory(newHistory);

    try {
      const response = await sendPlaygroundMessage(selectedAgentId, content, newHistory);
      
      if (response.success && response.message) {
        setHistory([...newHistory, response.message]);
        if (response.logs) {
          setLog(response.logs);
        }
      } else {
        toast.error(response.error || 'Failed to get a response from the agent.');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setHistory([]);
    setLog(null);
    toast.success('Conversation reset.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header controls */}
      <div className="flex items-center justify-between p-4 bg-background border-b rounded-t-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Agent:</span>
            <Select value={selectedAgentId} onValueChange={(val) => val && setSelectedAgentId(val)}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Model:</span>
            <Select value={model} onValueChange={(val) => val && setModel(val)}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Agent Default</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gemini-2.5-flash">Gemini Flash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-9">
            <Trash2 className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="default" size="sm" className="h-9" disabled={!selectedAgentId}>
            <Play className="h-4 w-4 mr-2" />
            Test Settings
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: Chat */}
        <div className="flex-1 min-w-0 p-4 border-r">
          <ChatInterface 
            history={history} 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing} 
          />
        </div>

        {/* Right pane: Developer Logs */}
        <div className="w-[450px] shrink-0 p-4 bg-muted/10">
          <DeveloperPanel log={log} history={history} />
        </div>
      </div>
    </div>
  );
}
