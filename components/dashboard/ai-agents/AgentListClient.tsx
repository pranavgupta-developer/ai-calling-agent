"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AIAgent } from "@/types/ai-agent";
import { createAgent, updateAgent, softDeleteAgent, toggleAgent, duplicateAgent } from "@/app/actions/ai-agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AgentCard } from "./AgentCard";
import { AgentForm } from "./AgentForm";
import { EmptyState } from "./EmptyState";
import { AgentStats } from "./AgentStats";

interface AgentListClientProps {
  agents: AIAgent[];
}

export function AgentListClient({ agents }: AgentListClientProps) {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const handleCreateNew = () => {
    setSelectedAgent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setIsFormOpen(true);
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(search.toLowerCase()) || 
    (agent.description && agent.description.toLowerCase().includes(search.toLowerCase())) ||
    agent.system_prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AgentStats />

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input 
          placeholder="Search agents..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {filteredAgents.length === 0 ? (
        <EmptyState 
          title={search ? "No agents match your search" : "No agents found"}
          description={search ? "Try a different search term" : "Get started by creating your first AI Agent."}
          actionLabel={search ? "Clear Search" : "Create Agent"}
          onAction={search ? () => setSearch("") : handleCreateNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <AgentCard 
              key={agent.id}
              agent={agent}
              onEdit={handleEdit}
              onDelete={softDeleteAgent}
              onToggleStatus={toggleAgent}
              onDuplicate={duplicateAgent}
            />
          ))}
        </div>
      )}

      <AgentForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        agent={selectedAgent}
        onSubmit={selectedAgent ? (data) => updateAgent(selectedAgent.id, data) : createAgent}
      />
    </div>
  );
}
