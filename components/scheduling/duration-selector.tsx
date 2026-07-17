'use client';

import { AVAILABLE_DURATIONS } from '@/lib/scheduling';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DurationSelector({ value, onChange, disabled }: DurationSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="duration">Duration</Label>
      <Select 
        disabled={disabled}
        value={value.toString()} 
        onValueChange={(val) => { if (val) onChange(parseInt(val, 10)) }}
      >
        <SelectTrigger id="duration" className="w-full">
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_DURATIONS.map((dur) => (
            <SelectItem key={dur} value={dur.toString()}>
              {dur} minutes
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
