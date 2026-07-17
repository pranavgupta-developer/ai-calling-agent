import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AIAgent } from '@/types/ai-agent';
import { TestModeLayout } from '@/features/ai-playground/components/test-mode-layout';

export default async function AgentTestPage({ params }: { params: Promise<{ agentId: string }> }) {
  const resolvedParams = await params;
  const agentId = resolvedParams.agentId;

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/sign-in');
  }

  // Get agency_id for the user
  let agencyId = null;
  
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();
    
  if (agency) {
    agencyId = agency.id;
  } else {
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('auth_user_id', user.id)
      .single();
    if (agencyUser) {
      agencyId = agencyUser.agency_id;
    }
  }

  if (!agencyId) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Agency Required</h2>
          <p className="text-muted-foreground">You must belong to an agency to use the Test Mode.</p>
        </div>
      </div>
    );
  }

  // Fetch the agent
  const { data: agent, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('id', agentId)
    .eq('agency_id', agencyId)
    .is('deleted_at', null)
    .single();

  if (error || !agent) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground">This agent does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 px-6 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Test Mode: {agent.name}</h1>
        <p className="text-muted-foreground">
          Simulate conversations and inspect tool executions safely.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <TestModeLayout agent={agent as AIAgent} />
      </div>
    </div>
  );
}
