import { createClient } from '@/lib/supabase/server';
import AgentTestWidget from './AgentTestWidget';

export default async function AgentTestPage() {
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from('ai_agents')
    .select('id, name')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">AI Agent Test Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Internal Developer Tool
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
        <AgentTestWidget agents={agents || []} />
      </div>
    </div>
  );
}
