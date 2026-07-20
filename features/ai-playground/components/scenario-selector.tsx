'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, PlayCircle } from 'lucide-react';
import { TestMessage } from '../types/test-session';

const SCENARIOS = [
  {
    name: 'Luxury Buyer',
    message: 'Hi, I am looking for a luxury penthouse in downtown with a budget of $5M. Do you have any listings?',
  },
  {
    name: 'Budget Buyer',
    message: 'I need a 2 bedroom apartment under $300k, preferably near public transit.',
  },
  {
    name: 'Rental Inquiry',
    message: 'Are there any pet-friendly rentals available next month?',
  },
  {
    name: 'Commercial Investor',
    message: 'I am looking for retail spaces with high foot traffic for a new cafe.',
  },
  {
    name: 'Property Viewing',
    message: 'I want to schedule a viewing for the property at 123 Main St this weekend.',
  },
];

export function ScenarioSelector({
  onSelect,
}: {
  onSelect: (scenarioMessage: TestMessage) => void;
}) {
  const handleSelect = (scenario: typeof SCENARIOS[0]) => {
    onSelect({
      id: crypto.randomUUID(),
      session_id: 'pending',
      role: 'user',
      content: scenario.message,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
        <PlayCircle className="w-4 h-4 mr-2" />
        Scenarios
        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {SCENARIOS.map((s, idx) => (
          <DropdownMenuItem key={idx} onClick={() => handleSelect(s)}>
            {s.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
