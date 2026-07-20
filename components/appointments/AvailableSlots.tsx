'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Sunset, Moon } from 'lucide-react';
import { checkAvailableSlotsAction } from '@/lib/actions/appointments';
import { cn } from '@/lib/utils';

interface AvailableSlotsProps {
  date: string;
  onSelectSlot: (time: string) => void;
  selectedTime?: string;
}

export function AvailableSlots({ date, onSelectSlot, selectedTime }: AvailableSlotsProps) {
  const [slots, setSlots] = useState<{ morning: string[]; afternoon: string[]; evening: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    
    let isMounted = true;
    setIsLoading(true);
    
    checkAvailableSlotsAction(date).then((data) => {
      if (isMounted) {
        setSlots(data);
        setIsLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [date]);

  if (!date) {
    return <div className="text-center p-4 text-sm text-muted-foreground border rounded-md">Please select a date first.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-md h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!slots) {
    return <div className="text-center p-4 text-sm text-destructive border rounded-md">Failed to load slots.</div>;
  }

  const renderSlotGroup = (title: string, icon: React.ReactNode, times: string[]) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        {icon} {title}
      </h4>
      {times.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No slots available</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {times.map((time) => (
            <Button
              key={time}
              type="button"
              variant={selectedTime === time ? "default" : "outline"}
              className={cn("w-full transition-all", selectedTime === time && "ring-2 ring-primary ring-offset-2")}
              onClick={() => onSelectSlot(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 border rounded-md bg-card">
      {renderSlotGroup("Morning", <Sun className="h-4 w-4" />, slots.morning)}
      {renderSlotGroup("Afternoon", <Sunset className="h-4 w-4" />, slots.afternoon)}
      {renderSlotGroup("Evening", <Moon className="h-4 w-4" />, slots.evening)}
    </div>
  );
}
