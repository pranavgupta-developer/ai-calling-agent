import { Suspense } from "react";
import { getKnowledgeEntries, getKnowledgeStats } from "@/app/actions/knowledge-base";
import { KnowledgeStats } from "./_components/knowledge-stats";
import { KnowledgeFilters } from "./_components/knowledge-filters";
import { KnowledgeTable } from "./_components/knowledge-table";
import { KnowledgeForm } from "./_components/knowledge-form";
import { KnowledgeLoadingSkeleton } from "./_components/loading-skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchKnowledgeBaseQuery } from "@/lib/validations/knowledge-base";

export const metadata = {
  title: "Knowledge Base | Dashboard",
  description: "Manage your agency's knowledge base and FAQs",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function KnowledgeBasePage({ searchParams }: PageProps) {
  // Await search params since Next.js 15
  const params = await searchParams;

  const query: SearchKnowledgeBaseQuery = {
    q: typeof params.q === "string" ? params.q : undefined,
    page: typeof params.page === "string" ? parseInt(params.page, 10) : 1,
    limit: typeof params.limit === "string" ? parseInt(params.limit, 10) : 20,
    category: typeof params.category === "string" ? params.category : undefined,
    status: typeof params.status === "string" ? params.status as any : "active",
    source: typeof params.source === "string" ? params.source as any : "all",
    sort: typeof params.sort === "string" ? params.sort as any : "newest",
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground mt-1">
            Manage FAQs and facts that the AI agent uses to answer client questions.
          </p>
        </div>
        <KnowledgeForm />
      </div>

      <Suspense fallback={<KnowledgeLoadingSkeleton />}>
        <KnowledgeBaseContent query={query} />
      </Suspense>
    </div>
  );
}

async function KnowledgeBaseContent({ query }: { query: SearchKnowledgeBaseQuery }) {
  // Fetch data in parallel
  const [entriesRes, statsRes] = await Promise.all([
    getKnowledgeEntries(query),
    getKnowledgeStats(),
  ]);

  if (entriesRes.error || statsRes.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {entriesRes.error || statsRes.error}
          <br />
          Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const { data: entries, totalPages, page } = entriesRes;
  const stats = statsRes.data!;

  return (
    <div className="space-y-6">
      <KnowledgeFilters />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 order-2 lg:order-1">
          <KnowledgeTable 
            entries={entries || []} 
            totalPages={totalPages || 1} 
            currentPage={page || 1}
          />
        </div>
        <div className="w-full lg:w-72 shrink-0 order-1 lg:order-2">
          {/* We display stats in cards. To fit side by side we can re-purpose or use it as is */}
          <div className="sticky top-6">
            <h3 className="text-lg font-medium mb-4">Overview</h3>
            <KnowledgeStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
