import { AiTestClient } from '@/features/knowledge-base/components/ai-test-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AiTestPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
        <Link 
          href="/dashboard/knowledge-base"
          className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Playground</h1>
          <p className="text-muted-foreground mt-1">
            Test how the AI retrieves knowledge base entries.
          </p>
        </div>
      </div>

      <AiTestClient />
    </div>
  );
}
