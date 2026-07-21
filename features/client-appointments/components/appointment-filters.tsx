'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCallback } from 'react';

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
];

const PAYMENT_OPTIONS = [
  { label: 'All Payments', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid Online', value: 'paid_online' },
  { label: 'Paid Cash', value: 'paid_cash' },
  { label: 'Refunded', value: 'refunded' },
];

const PROPERTY_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Villa', value: 'villa' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Office', value: 'office' },
  { label: 'Rental', value: 'rental' },
  { label: 'Sale', value: 'sale' },
];

const DATE_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
];

const SORT_OPTIONS = [
  { label: 'Nearest Appointment', value: 'nearest' },
  { label: 'Newest Booked', value: 'newest' },
  { label: 'Oldest Booked', value: 'oldest' },
  { label: 'Price (Low to High)', value: 'price_asc' },
  { label: 'Price (High to Low)', value: 'price_desc' },
  { label: 'Agency Name', value: 'agency' },
  { label: 'Recently Updated', value: 'updated' },
];

export function AppointmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = (searchParams?.get('status') as string) || 'all';
  const currentPayment = (searchParams?.get('payment') as string) || 'all';
  const currentPropertyType = (searchParams?.get('propertyType') as string) || 'all';
  const currentDate = (searchParams?.get('dateRange') as string) || 'all';
  const currentSort = (searchParams?.get('sortBy') as string) || 'nearest';

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || (value === 'all' && key !== 'sortBy')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset page to 1 on filter change
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('payment');
    params.delete('propertyType');
    params.delete('dateRange');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const activeFilterCount = [
    currentStatus !== 'all',
    currentPayment !== 'all',
    currentPropertyType !== 'all',
    currentDate !== 'all'
  ].filter(Boolean).length;

  const FilterContents = () => (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <Select value={currentStatus} onValueChange={(val) => updateParam('status', val)}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-card/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Payment</label>
        <Select value={currentPayment} onValueChange={(val) => updateParam('payment', val)}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-card/50 border-border/50">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Property Type</label>
        <Select value={currentPropertyType} onValueChange={(val) => updateParam('propertyType', val)}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-card/50 border-border/50">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Date Range</label>
        <Select value={currentDate} onValueChange={(val) => updateParam('dateRange', val)}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-card/50 border-border/50">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {activeFilterCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="w-full text-muted-foreground hover:text-foreground mt-2"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {/* Mobile Filter Drawer */}
      <Sheet>
        <SheetTrigger className={buttonVariants({ variant: "outline", className: "lg:hidden h-10 rounded-full px-4 border-border/50 bg-card/50" })}>
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary/20 text-primary">
              {activeFilterCount}
            </Badge>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter Appointments
            </SheetTitle>
          </SheetHeader>
          <FilterContents />
        </SheetContent>
      </Sheet>

      {/* Desktop Inline Filters */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        <Select value={currentStatus} onValueChange={(val) => updateParam('status', val)}>
          <SelectTrigger className="w-[140px] h-10 rounded-full bg-card/50 border-border/50 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentPayment} onValueChange={(val) => updateParam('payment', val)}>
          <SelectTrigger className="w-[150px] h-10 rounded-full bg-card/50 border-border/50 text-sm">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentPropertyType} onValueChange={(val) => updateParam('propertyType', val)}>
          <SelectTrigger className="w-[150px] h-10 rounded-full bg-card/50 border-border/50 text-sm">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentDate} onValueChange={(val) => updateParam('dateRange', val)}>
          <SelectTrigger className="w-[140px] h-10 rounded-full bg-card/50 border-border/50 text-sm">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {DATE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearFilters}
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 ml-1"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Sorting (Common for both mobile and desktop) */}
      <Select value={currentSort} onValueChange={(val) => updateParam('sortBy', val)}>
        <SelectTrigger className="w-[180px] h-10 rounded-full bg-card/50 border-border/50 font-medium">
          <div className="flex items-center">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
