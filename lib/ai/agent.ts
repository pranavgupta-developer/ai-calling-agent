import { SupabaseClient } from '@supabase/supabase-js';
import { AgentConfig } from './types';
import { AIAgent } from '@/types/ai-agent';

export async function getAgentConfig(
  supabase: SupabaseClient,
  agentId: string
): Promise<AgentConfig> {
  const { data: agent, error: agentError } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    throw new Error(`Failed to load agent configuration: ${agentError?.message || 'Agent not found'}`);
  }

  const { data: listings } = await supabase
    .from('agent_listings')
    .select('listing_id')
    .eq('agent_id', agentId);

  const { data: services } = await supabase
    .from('agent_services')
    .select('service_id')
    .eq('agent_id', agentId);

  const assignedListings = (listings || []).map((l: any) => l.listing_id);
  const assignedServices = (services || []).map((s: any) => s.service_id);

  return {
    ...(agent as AIAgent),
    assigned_listings: assignedListings,
    assigned_services: assignedServices,
  };
}
