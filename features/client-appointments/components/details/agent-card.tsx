"use client";

import { ClientAppointmentDetails } from "@/types/client-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Bot, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AgentCard({ appointment }: { appointment: ClientAppointmentDetails }) {
  if (!appointment.agent) return null;

  const agent = appointment.agent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assigned Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden text-primary">
            {agent.is_ai ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{agent.name}</h3>
              {agent.is_ai && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">AI</Badge>}
            </div>
            <p className="text-muted-foreground text-xs">{agent.is_ai ? "Virtual Assistant" : "Real Estate Agent"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {agent.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`tel:${agent.phone}`} className="hover:underline hover:text-primary transition-colors">
                {agent.phone}
              </a>
            </div>
          )}
          {agent.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${agent.email}`} className="hover:underline hover:text-primary transition-colors line-clamp-1">
                {agent.email}
              </a>
            </div>
          )}
          {agent.language && (
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="capitalize">{agent.language}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
