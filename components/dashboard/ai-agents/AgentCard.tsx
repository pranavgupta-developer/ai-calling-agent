"use client";

import { useState } from "react";
import { MoreVertical, Settings2, Trash2, Edit3, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { AIAgent } from "@/types/ai-agent";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { AgentStatusBadge } from "./AgentStatusBadge";
import { ProviderBadge } from "./ProviderBadge";
import { DeleteDialog } from "./DeleteDialog";

interface AgentCardProps {
  agent: AIAgent;
  onEdit: (agent: AIAgent) => void;
  onToggleStatus: (id: string, status: boolean) => Promise<{ error?: string; success?: boolean }>;
  onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
  onDuplicate: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export function AgentCard({ agent, onEdit, onToggleStatus, onDelete, onDuplicate }: AgentCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    try {
      setIsToggling(true);
      const result = await onToggleStatus(agent.id, !checked); // pass current status which is !checked
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Agent ${checked ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl line-clamp-1" title={agent.name}>{agent.name}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px]" title={agent.description || "No description provided"}>
                {agent.description || <span className="italic text-slate-400">No description provided</span>}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-slate-100 h-8 w-8 -mt-2 -mr-2 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(agent)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    const res = await onDuplicate(agent.id);
                    if (res?.error) toast.error(res.error);
                    else toast.success("Agent duplicated successfully");
                  } catch(err) {
                    toast.error("Failed to duplicate agent");
                  }
                }}>
                  <MoreVertical className="mr-2 h-4 w-4" />
                  Duplicate Agent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <AgentStatusBadge isActive={agent.is_active} />
              <ProviderBadge provider={agent.provider} />
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                {agent.model}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="truncate" title={agent.greeting}>{agent.greeting}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Personality</span>
                <span className="font-medium">{agent.personality}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Language</span>
                <span className="font-medium">{agent.language}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-4 pb-4 border-t bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Switch 
              checked={agent.is_active} 
              onCheckedChange={handleToggle}
              disabled={isToggling}
              aria-label="Toggle agent active status"
            />
            <span className="text-sm font-medium text-slate-700">
              {agent.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white">
              <Settings2 className="mr-1.5 h-3 w-3" />
              Assign
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DeleteDialog 
        agentId={agent.id}
        agentName={agent.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={onDelete}
      />
    </>
  );
}
