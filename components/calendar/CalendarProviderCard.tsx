import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";

interface CalendarProviderCardProps {
  provider: "google" | "outlook";
  email?: string;
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSync?: () => void;
}

export function CalendarProviderCard({ provider, email, connected, onConnect, onDisconnect, onSync }: CalendarProviderCardProps) {
  const providerName = provider === "google" ? "Google Calendar" : "Outlook Calendar";
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${provider === 'google' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{providerName}</h3>
            {connected && email ? (
              <p className="text-sm text-muted-foreground">{email}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>
        </div>
        
        {connected ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSync}>
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button variant="destructive" size="icon" onClick={onDisconnect}>
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={onConnect}>Connect</Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Sync your {providerName} to automatically block off busy times and push new AI appointments to your personal schedule.
      </p>
    </Card>
  );
}
