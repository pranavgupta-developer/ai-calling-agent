'use client';

import { Button } from '@/components/ui/button';
import { Download, Save, RefreshCw, Trash2 } from 'lucide-react';
import { AIAgent } from '@/types/ai-agent';
import { TestMessage } from '../types/test-session';
import { saveTestSession } from '../actions/test-session-actions';
import { toast } from 'sonner';
import { useState } from 'react';

import { ScenarioSelector } from './scenario-selector';

export function SessionToolbar({
  agent,
  messages,
  sessionId,
  onSessionLoaded,
  onClear,
  onScenarioSelect,
}: {
  agent: AIAgent;
  messages: TestMessage[];
  sessionId: string | null;
  onSessionLoaded: (id: string, msgs: TestMessage[]) => void;
  onClear: () => void;
  onScenarioSelect?: (msg: TestMessage) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (messages.length === 0) {
      toast.error('Cannot save empty session');
      return;
    }
    
    setIsSaving(true);
    try {
      const session = await saveTestSession(
        { agent_id: agent.id, name: `Test Session ${new Date().toLocaleString()}` },
        messages
      );
      toast.success('Session saved successfully');
      onSessionLoaded(session.id, messages);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ agent: agent.name, messages }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `agent_test_${agent.id}_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Chat Simulation</h2>
      <div className="flex gap-2">
        {onScenarioSelect && <ScenarioSelector onSelect={onScenarioSelect} />}
        <Button variant="outline" size="sm" onClick={onClear} title="Clear Session">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || messages.length === 0} title="Save Session">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={messages.length === 0} title="Export JSON">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
