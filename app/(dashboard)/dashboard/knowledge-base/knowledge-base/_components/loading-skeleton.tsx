import { Skeleton } from "@/components/ui/skeleton";

export function KnowledgeLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-10 w-full sm:max-w-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="h-12 bg-muted/50 border-b flex items-center px-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4 ml-auto" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b last:border-0 flex items-start gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
