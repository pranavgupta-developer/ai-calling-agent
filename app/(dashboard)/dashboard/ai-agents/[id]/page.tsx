import { notFound } from "next/navigation";
import { Bot, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAgent } from "@/app/actions/ai-agent";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceConfiguration } from "@/components/dashboard/ai-agents/VoiceConfiguration";
import { VoiceAnalytics } from "@/components/dashboard/ai-agents/VoiceAnalytics";
import { AgentStatusBadge } from "@/components/dashboard/ai-agents/AgentStatusBadge";
import { ProviderBadge } from "@/components/dashboard/ai-agents/ProviderBadge";
import { AIAgent } from "@/types/ai-agent";

export const metadata = {
  title: "Agent Management | Dashboard",
  description: "Manage AI agent settings and voice configuration.",
};

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  // 1. Fetch basic agent info
  const agentResult = await getAgent(id);
  if (agentResult.error || !agentResult.data) {
    notFound();
  }
  const agent = agentResult.data as AIAgent;

  // 2. Fetch voice config & phone number
  const supabase = await createClient();

  const [voiceConfigRes, phoneNumberRes] = await Promise.all([
    supabase.from("agent_voice_configs").select("*").eq("agent_id", id).single(),
    supabase.from("agent_phone_numbers").select("*").eq("agent_id", id).eq("status", "active").single(),
  ]);

  const voiceConfig = voiceConfigRes.data || null;
  const phoneNumber = phoneNumberRes.data || null;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/ai-agents">
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              {agent.name}
            </h2>
            <div className="ml-2 flex items-center gap-2">
              <AgentStatusBadge isActive={agent.is_active} />
              <ProviderBadge provider={agent.provider} />
            </div>
          </div>
          <p className="text-muted-foreground ml-10">
            {agent.description || "Manage settings and voice configuration for this agent."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="voice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Agent Information</TabsTrigger>
          <TabsTrigger value="voice">Voice Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Core Identity</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">System Prompt</div>
                  <div className="mt-1 text-sm bg-slate-50 p-3 rounded-md border">{agent.system_prompt}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Greeting</div>
                  <div className="mt-1 text-sm bg-slate-50 p-3 rounded-md border">{agent.greeting}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Personality</div>
                    <div className="mt-1 text-sm font-medium">{agent.personality}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Language</div>
                    <div className="mt-1 text-sm font-medium">{agent.language}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Assignments</h3>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  View and manage assigned properties and services (Coming Soon).
                </div>
                {/* Real-time assignment components will be implemented here */}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="voice" className="space-y-4">
          <VoiceConfiguration 
            agent={agent} 
            voiceConfig={voiceConfig} 
            phoneNumber={phoneNumber} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <VoiceAnalytics agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
