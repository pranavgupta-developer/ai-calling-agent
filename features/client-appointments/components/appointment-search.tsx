'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export function AppointmentSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(currentQuery);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  // Debounced update
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue !== currentQuery) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (inputValue) {
            params.set('q', inputValue);
          } else {
            params.delete('q');
          }
          // Reset page when searching
          params.set('page', '1');
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputValue, currentQuery, pathname, router, searchParams]);

  return (
    <div className="relative w-full md:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search properties or agencies..."
        className="pl-9 bg-card/50 backdrop-blur-sm border-border/50 rounded-full h-10"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
