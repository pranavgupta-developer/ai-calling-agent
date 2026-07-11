import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertyTable } from "@/components/properties/property-table";
import { getProperties } from "@/lib/actions/properties/get-properties";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Properties | Real Estate AI",
  description: "Manage your agency's property listings.",
};

export default async function PropertiesPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    type?: string;
    status?: string;
    price?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground mt-1">
            Manage your listings, update statuses, and toggle visibility.
          </p>
        </div>
        <Link 
          href="/dashboard/properties/new"
          className={cn(buttonVariants({ variant: "default" }), "rounded-xl shadow-md h-10 w-full sm:w-auto")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Link>
      </div>

      <PropertyFilters />

      <Suspense fallback={<PropertiesTableSkeleton />}>
        <PropertiesData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PropertiesData({
  searchParams,
}: {
  searchParams: {
    page?: string;
    query?: string;
    type?: string;
    status?: string;
    price?: string;
  };
}) {
  const page = Number(searchParams?.page) || 1;
  const result = await getProperties({
    page,
    query: searchParams?.query,
    type: searchParams?.type,
    status: searchParams?.status,
    price: searchParams?.price,
  });

  if (result.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center mt-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Failed to load properties
        </h3>
        <p className="text-sm text-destructive/80 mb-4">{result.error}</p>
        <Link href="/dashboard/properties" className={buttonVariants({ variant: "outline" })}>
          Retry
        </Link>
      </div>
    );
  }

  return (
    <PropertyTable
      properties={result.data || []}
      totalPages={result.totalPages || 0}
    />
  );
}

function PropertiesTableSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b p-4 flex gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-24" />
          ))}
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
