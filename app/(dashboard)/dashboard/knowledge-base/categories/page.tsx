import { getKnowledgeCategories } from '@/features/knowledge-base/queries/categories';
import { CategoriesClient } from '@/features/knowledge-base/components/categories-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function KnowledgeCategoriesPage() {
  const result = await getKnowledgeCategories();
  const categories = result.success && result.data ? result.data : [];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/knowledge-base"
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage categories for your knowledge base entries.
          </p>
        </div>
      </div>

      <CategoriesClient categories={categories} />
    </div>
  );
}
