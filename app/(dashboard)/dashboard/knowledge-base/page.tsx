import { getKnowledgeEntries } from '@/features/knowledge-base/queries/entries';
import { getKnowledgeAnalytics } from '@/features/knowledge-base/queries/analytics';
import { EntriesClient } from '@/features/knowledge-base/components/entries-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BrainCircuit, Activity, Tags } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const [entriesResult, analyticsResult] = await Promise.all([
    getKnowledgeEntries(),
    getKnowledgeAnalytics()
  ]);

  const entries = entriesResult.success && entriesResult.data ? entriesResult.data : [];
  const analytics = analyticsResult.success && analyticsResult.data ? analyticsResult.data : {
    totalEntries: 0,
    activeEntries: 0,
    aiEnabledEntries: 0,
    totalCategories: 0,
    aiUsageCount: 0
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Manage your AI agent's source of truth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/knowledge-base/test" className={buttonVariants({ variant: 'outline' })}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            Test AI
          </Link>
          <Link href="/dashboard/knowledge-base/categories" className={buttonVariants({ variant: 'outline' })}>
            <Tags className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeEntries} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Enabled</CardTitle>
            <BrainCircuit className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.aiEnabledEntries}</div>
            <p className="text-xs text-muted-foreground">
              Used in AI responses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Topics covered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.aiUsageCount}</div>
            <p className="text-xs text-muted-foreground">
              Total retrievals
            </p>
          </CardContent>
        </Card>
      </div>

      <EntriesClient entries={entries} />
    </div>
  );
}
