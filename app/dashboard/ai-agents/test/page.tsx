import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PlaygroundLayout } from '@/features/ai-playground/components/playground-layout';
import { AIAgent } from '@/types/ai-agent';

export default async function AIPlaygroundPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/sign-in');
  }

  // Get agency_id for the user
  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single();

  if (!profile?.agency_id) {
    // Fallback if no profile is found or user doesn't have an agency
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Agency Required</h2>
          <p className="text-muted-foreground">You must belong to an agency to use the AI Playground.</p>
        </div>
      </div>
    );
  }

  // Fetch agents for the agency
  const { data: agents, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents:', error);
  }

  const typedAgents = (agents || []) as AIAgent[];

  return (
    <div className="h-full">
      <div className="mb-6 px-4 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
        <p className="text-muted-foreground">
          Test and debug your AI agents in a safe, isolated environment.
        </p>
      </div>

      <div className="px-4 pb-4">
        {typedAgents.length === 0 ? (
          <div className="flex flex-col h-[60vh] items-center justify-center border rounded-xl border-dashed">
            <h2 className="text-xl font-semibold mb-2">No Agents Found</h2>
            <p className="text-muted-foreground mb-4">Create an AI agent first to test it in the playground.</p>
          </div>
        ) : (
          <PlaygroundLayout agents={typedAgents} />
        )}
      </div>
    </div>
  );
}
