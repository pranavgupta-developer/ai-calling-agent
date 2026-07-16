import { createClient } from "@/lib/supabase/server";

export type PlanType = 'free' | 'pro' | 'business';

export const PLAN_LIMITS = {
  free: {
    maxAgents: 1,
  },
  pro: {
    maxAgents: 10,
  },
  business: {
    maxAgents: 99,
  },
};

export async function checkAgentLimit(agencyId: string): Promise<{ allowed: boolean; currentCount: number; limit: number; error?: string }> {
  const supabase = await createClient();

  // 1. Get the current plan for the agency
  const { data: billing, error: billingError } = await supabase
    .from("billing")
    .select("plan")
    .eq("agency_id", agencyId)
    .single();

  // Default to free plan if no billing record exists
  const currentPlan = (billing?.plan?.toLowerCase() || "free") as PlanType;
  const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

  if (billingError && billingError.code !== 'PGRST116') {
    return { allowed: false, currentCount: 0, limit: planLimits.maxAgents, error: "Failed to check billing plan." };
  }

  // 2. Count current agents
  const { count: currentAgentsCount, error: countError } = await supabase
    .from("ai_agents")
    .select("*", { count: "exact", head: true })
    .eq("agency_id", agencyId);

  if (countError) {
    return { allowed: false, currentCount: 0, limit: planLimits.maxAgents, error: "Failed to count existing agents." };
  }

  const count = currentAgentsCount || 0;
  
  return {
    allowed: count < planLimits.maxAgents,
    currentCount: count,
    limit: planLimits.maxAgents,
  };
}
