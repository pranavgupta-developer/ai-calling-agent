import { getKnowledgeEntry } from '@/features/knowledge-base/queries/entries';
import { getEntryVersions } from '@/features/knowledge-base/actions/versions';
import { ArrowLeft, FileEdit, BrainCircuit, Activity, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function KnowledgeEntryDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const [entryResult, versionsResult] = await Promise.all([
    getKnowledgeEntry(id),
    getEntryVersions(id)
  ]);

  if (!entryResult.success || !entryResult.data) {
    notFound();
  }

  const entry = entryResult.data;
  const versions = versionsResult.success && versionsResult.data ? versionsResult.data : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/knowledge-base"
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Entry Details</h1>
              <Badge variant={entry.is_ai_enabled ? 'default' : 'secondary'} className={entry.is_ai_enabled ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                <BrainCircuit className="h-3 w-3 mr-1" />
                {entry.is_ai_enabled ? 'AI Enabled' : 'AI Disabled'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Last updated {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <Link href={`/dashboard/knowledge-base/${entry.id}/edit`} className={buttonVariants()}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Question / Topic</h3>
                <p className="text-lg font-medium">{entry.question}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Answer</h3>
                <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
                  {entry.answer}
                </div>
              </div>
              {entry.keywords && entry.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.keywords.map((kw: string) => (
                      <Badge key={kw} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="versions">
            <TabsList>
              <TabsTrigger value="versions">Version History</TabsTrigger>
              <TabsTrigger value="logs">Usage Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="versions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>View previous versions of this entry for AI debugging.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 border-l-2 border-muted pl-4 ml-2">
                    {versions.map((v: any) => (
                      <div key={v.id} className="relative">
                        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                        <div className="mb-1 text-sm font-medium">
                          {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md line-clamp-3">
                          {v.answer}
                        </div>
                      </div>
                    ))}
                    {versions.length === 0 && (
                      <p className="text-muted-foreground text-sm">No version history available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Usage logs will be available here when the AI agent starts querying this entry.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-medium">
                  {entry.category ? entry.category.name : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">{entry.status}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline">{entry.priority}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="font-medium uppercase">{entry.language}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Source Type</span>
                <span className="font-medium text-sm">{entry.source_type}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-full text-blue-500">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{entry.usage_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-full text-purple-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Used</p>
                  <p className="text-sm font-bold">
                    {entry.last_used_at ? formatDistanceToNow(new Date(entry.last_used_at), { addSuffix: true }) : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {entry.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
