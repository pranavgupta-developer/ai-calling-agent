'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { useCallback } from 'react';

export function AppointmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete('page'); // Reset page when filtering
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    router.replace(`${pathname}?${createQueryString(key, value)}`);
  };

  const clearFilters = () => {
    router.replace(pathname); // Clears all search params
  };

  const hasFilters = searchParams.has('status') || searchParams.has('source') || searchParams.has('payment_status');

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <Select
        value={(searchParams.get('status') || 'all') as string}
        onValueChange={(val: string | null) => val && handleFilterChange('status', val)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="no_show">No Show</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(searchParams.get('source') || 'all') as string}
        onValueChange={(val: string | null) => val && handleFilterChange('source', val)}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="dashboard">Dashboard</SelectItem>
          <SelectItem value="website">Website Form</SelectItem>
          <SelectItem value="widget">Widget</SelectItem>
          <SelectItem value="voice">AI Voice</SelectItem>
          <SelectItem value="api">API</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(searchParams.get('payment_status') || 'all') as string}
        onValueChange={(val: string | null) => val && handleFilterChange('payment_status', val)}
      >
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paid_cash">Paid Cash</SelectItem>
          <SelectItem value="paid_online">Paid Online</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
        >
          <FilterX className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
