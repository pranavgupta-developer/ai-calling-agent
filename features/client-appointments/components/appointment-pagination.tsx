'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AppointmentPaginationProps {
  totalItems: number;
  pageSize: number;
}

export function AppointmentPagination({ totalItems, pageSize }: AppointmentPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Number(searchParams.get('page')) || 1;

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page), { scroll: true }); // scroll to top on pagination
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border/50">
      <p className="text-sm text-muted-foreground hidden md:block">
        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
        <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
        <span className="font-medium">{totalItems}</span> appointments
      </p>

      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-9 px-4"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        <div className="flex items-center gap-1 md:hidden">
          <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Simple pagination logic for displaying page numbers
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="icon"
                  className={`w-9 h-9 rounded-full ${currentPage === page ? 'shadow-sm' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            } else if (
              page === currentPage - 2 ||
              page === currentPage + 2
            ) {
              return (
                <div key={page} className="w-9 h-9 flex items-center justify-center text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-9 px-4"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
