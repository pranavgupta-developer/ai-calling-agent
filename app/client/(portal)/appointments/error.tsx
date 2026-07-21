'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client Appointments Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We encountered an error while loading your appointments. Please try again.
      </p>
      <Button onClick={() => reset()} className="rounded-full px-8 gap-2">
        <RefreshCcw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}
