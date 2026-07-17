'use client';

import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvailableSlotsListProps {
  slots: { start: string; end: string; available: boolean; reason?: string }[];
  onSelectSlot: (slot: { start: string; end: string }) => void;
  selectedSlot: { start: string; end: string } | null;
  isLoading: boolean;
  timezone: string;
}

export function AvailableSlotsList({ slots, onSelectSlot, selectedSlot, isLoading, timezone }: AvailableSlotsListProps) {
  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse">Loading available slots...</div>;
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md bg-muted/50">
        <p className="text-muted-foreground">No available slots for this date.</p>
      </div>
    );
  }

  const availableOnly = slots.filter(s => s.available);

  if (availableOnly.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md bg-muted/50">
        <p className="text-muted-foreground">All slots are booked or past for this date.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border p-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {availableOnly.map((slot) => {
          const isSelected = selectedSlot?.start === slot.start;
          const timeString = format(parseISO(slot.start), 'HH:mm');

          return (
            <Button
              key={slot.start}
              variant={isSelected ? 'default' : 'outline'}
              className="w-full"
              onClick={() => onSelectSlot(slot)}
            >
              {timeString}
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
