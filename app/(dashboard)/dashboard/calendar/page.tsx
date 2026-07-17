"use client";

import { CalendarProviderCard } from "@/components/calendar/CalendarProviderCard";

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Calendar Integrations</h2>
      </div>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <CalendarProviderCard 
          provider="google" 
          connected={false} 
          onConnect={() => console.log('Connect Google...')}
        />
        
        <CalendarProviderCard 
          provider="outlook" 
          connected={false} 
          onConnect={() => console.log('Connect Outlook...')}
        />
      </div>
    </div>
  );
}
