'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SchedulingCalendarProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  disabled?: boolean;
}

export function SchedulingCalendar({ date, onChange, disabled }: SchedulingCalendarProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date</Label>
      <Input
        type="date"
        id="date"
        disabled={disabled}
        value={date}
        min={new Date().toISOString().split('T')[0]} // Prevent past dates in UI natively
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
