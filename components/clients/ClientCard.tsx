import { Client } from "@/types/appointments";
import { Card } from "@/components/ui/card";
import { ClientAvatar } from "./ClientAvatar";
import { PhoneIcon, MailIcon, GlobeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <Card 
      className={`p-4 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-primary/50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <ClientAvatar name={client.full_name} className="w-12 h-12" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-lg">{client.full_name}</h4>
            <Badge variant="outline" className="capitalize text-xs">
              {client.source}
            </Badge>
          </div>
          
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            {client.email && (
              <div className="flex items-center">
                <MailIcon className="w-4 h-4 mr-2" />
                {client.email}
              </div>
            )}
            {client.phone && (
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {client.phone}
              </div>
            )}
            <div className="flex items-center">
              <GlobeIcon className="w-4 h-4 mr-2" />
              Language: {client.preferred_language.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
