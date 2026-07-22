import { EntryForm } from '@/features/knowledge-base/components/entry-form';
import { getKnowledgeCategories } from '@/features/knowledge-base/queries/categories';
import { getKnowledgeEntry } from '@/features/knowledge-base/queries/entries';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewKnowledgeEntryPage({
  searchParams
}: {
  searchParams: { duplicate?: string }
}) {
  const categoriesResult = await getKnowledgeCategories();
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  let initialData = null;

  if (searchParams.duplicate) {
    const entryResult = await getKnowledgeEntry(searchParams.duplicate);
    if (entryResult.success && entryResult.data) {
      // Remove ID and other generated fields so it acts as a new entry
      const { id, created_at, updated_at, embedding, last_used_at, usage_count, search_text, ...rest } = entryResult.data;
      initialData = {
        ...rest,
        question: `Copy of ${rest.question}`
      };
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/knowledge-base"
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Entry</h1>
          <p className="text-muted-foreground mt-1">
            Add new information to your AI's knowledge base.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <EntryForm categories={categories} initialData={initialData} />
      </div>
    </div>
  );
}
