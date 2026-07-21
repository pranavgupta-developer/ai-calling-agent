import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
        <div className="space-y-3 w-full md:w-1/2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 hidden sm:block" />
          <Skeleton className="h-9 w-32 hidden sm:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="w-full h-[400px] md:h-[500px] rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-20 w-28 rounded-md" />
              <Skeleton className="h-20 w-28 rounded-md" />
              <Skeleton className="h-20 w-28 rounded-md hidden sm:block" />
              <Skeleton className="h-20 w-28 rounded-md hidden sm:block" />
            </div>
          </div>

          {/* Details Skeleton */}
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[150px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
