"use client";

import { useState } from "react";
import { performSearch } from "./actions";
import { SearchResponse } from "@/lib/retrieval/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Info } from "lucide-react";

const SUGGESTIONS = [
  "mortgage",
  "home loan",
  "2 BHK",
  "villa",
  "commercial office",
  "sea view",
  "parking",
  "pet friendly",
  "investment",
  "rent",
  "buy",
  "sell",
  "luxury apartment",
  "cheap rental"
];

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function RetrievalTestPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    const response = await performSearch(searchQuery);

    if (response.success && response.data) {
      setResults(response.data);
    } else {
      setError(response.error || "Search failed");
      setResults(null);
    }
    
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Retrieval Engine Test</h2>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Query</CardTitle>
              <CardDescription>Test the retrieval engine before the AI agent uses it.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. I need a 2 bedroom apartment under 50 lakh" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="max-w-xl"
                />
                <Button onClick={() => handleSearch(query)} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map(suggestion => (
                  <Badge 
                    key={suggestion} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Info className="h-4 w-4" />
                Found {results.metadata.knowledgeCount} knowledge entries and {results.metadata.listingCount} listings in {results.metadata.searchTimeMs}ms
              </div>

              {results.metadata.knowledgeCount === 0 && results.metadata.listingCount === 0 && (
                <div className="rounded-md border p-8 text-center text-muted-foreground">
                  No matching knowledge or listings found.
                </div>
              )}

              {results.knowledge.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Knowledge Base</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.knowledge.map((k) => (
                      <Card key={k.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{k.question}</CardTitle>
                            <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-50">Score: {k.score}</Badge>
                          </div>
                          <CardDescription>{k.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{k.answer}</p>
                          <div className="mt-4 flex flex-wrap gap-1">
                            {k.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {results.listings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Property Listings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.listings.map((l) => (
                      <Card key={l.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{l.title}</CardTitle>
                            <Badge variant="outline" className="shrink-0 bg-green-50 text-green-700 hover:bg-green-50">Score: {l.score}</Badge>
                          </div>
                          <CardDescription>
                            {l.property_type} • {l.listing_type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold">{formatMoney(l.price)} <span className="text-sm font-normal text-muted-foreground">{l.price_type !== 'fixed' ? `/ ${l.price_type}` : ''}</span></p>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {l.bedrooms} Beds • {l.bathrooms} Baths • {l.parking} Parking
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                          <div className="mt-4 flex flex-wrap gap-1">
                            {l.amenities?.map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">{amenity}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
