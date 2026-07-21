import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        
        {/* Controls Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card/30 p-4 rounded-2xl border border-border/50">
          <Skeleton className="h-10 w-full md:max-w-xs rounded-full" />
          <div className="flex gap-2 w-full lg:w-auto">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full hidden md:block" />
            <Skeleton className="h-10 w-32 rounded-full hidden lg:block" />
            <Skeleton className="h-10 w-32 rounded-full hidden xl:block" />
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>

      </div>
    </div>
  );
}
