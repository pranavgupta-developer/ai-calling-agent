import { EntryForm } from '@/features/knowledge-base/components/entry-form';
import { getKnowledgeCategories } from '@/features/knowledge-base/queries/categories';
import { getKnowledgeEntry } from '@/features/knowledge-base/queries/entries';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditKnowledgeEntryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const [categoriesResult, entryResult] = await Promise.all([
    getKnowledgeCategories(),
    getKnowledgeEntry(id)
  ]);

  if (!entryResult.success || !entryResult.data) {
    notFound();
  }

  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const entry = entryResult.data;

  // Format related data for the form
  const initialData = {
    ...entry,
    service_ids: entry.services?.map((s: any) => s.service_id) || [],
    listing_ids: entry.listings?.map((l: any) => l.listing_id) || [],
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/knowledge-base/${params.id}`}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Entry</h1>
          <p className="text-muted-foreground mt-1">
            Update the AI's knowledge base entry.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <EntryForm categories={categories} initialData={initialData} />
      </div>
    </div>
  );
}
