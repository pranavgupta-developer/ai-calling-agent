'use client';

import { useState } from 'react';
import { testAiRetrieval } from '../actions/retrieval';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Search, Loader2, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { RetrievalResult } from '../ai/retrieval';

export function AiTestClient() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RetrievalResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await testAiRetrieval(query);
      if (res.success) {
        setResults(res.data as RetrievalResult[]);
      } else {
        setError(res.error || 'Failed to retrieve knowledge');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <Card className="border-primary/20 bg-gradient-to-b from-card to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Test AI Retrieval
          </CardTitle>
          <CardDescription>
            Enter a customer question to see which knowledge base entries the AI agent will retrieve to formulate its answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTest} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Do you have any 3 bedroom apartments under $3000?"
                className="pl-10 h-12 text-base"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching
                </>
              ) : (
                'Test Query'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            Retrieval Results
            <Badge variant="outline">{results.length} found</Badge>
          </h3>
          
          {results.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-lg border">
              <p className="text-muted-foreground">The AI couldn't find any relevant knowledge base entries for this query.</p>
              <p className="text-sm text-muted-foreground mt-2">Consider adding a new entry if this is a common question.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={result.id} className="overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 font-medium text-muted-foreground">
                      Rank #{index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Source: {result.source}</span>
                      <Badge variant="outline" className={
                        result.confidence > 0.8 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        result.confidence > 0.6 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }>
                        {(result.confidence * 100).toFixed(1)}% Confidence
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Matched Question</h4>
                      <p className="font-medium flex items-start justify-between">
                        {result.question}
                        <Link href={`/dashboard/knowledge-base/${result.id}`} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-6 w-6 -mr-2' })}>
                          <LinkIcon className="h-4 w-4" />
                        </Link>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">AI Answer Context</h4>
                      <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap">
                        {result.answer}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
