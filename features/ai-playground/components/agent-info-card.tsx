'use client';

import { AIAgent } from '@/types/ai-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AgentInfoCard({ agent }: { agent: AIAgent }) {
  // @ts-ignore - Assigned arrays are part of the extended type usually handled higher up
  const assignedListings = agent.assigned_listings?.length || 0;
  // @ts-ignore
  const assignedServices = agent.assigned_services?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Agent Details
          <Badge variant={agent.is_active ? 'default' : 'secondary'}>
            {agent.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">Language</span>
            <span className="font-medium capitalize">{agent.language}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Voice</span>
            <span className="font-medium capitalize">{agent.voice}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Model</span>
            <span className="font-medium">{agent.model}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Provider</span>
            <span className="font-medium">{agent.provider}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Listings</span>
            <span className="font-medium">{assignedListings}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Services</span>
            <span className="font-medium">{assignedServices}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
