"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";


import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [query, setQuery] = useState(searchParams?.get("query") ?? "");
  
  // Create a query string with updated params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page"); // Reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("query") || "";
      if (query !== currentQuery) {
        router.push(pathname + "?" + createQueryString("query", query));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, pathname, router, createQueryString, searchParams]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          className="pl-9 bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          key={`type-${searchParams?.get("type") ?? "All"}`}
          defaultValue={searchParams?.get("type") ?? "All"}
          onValueChange={(val) => router.push((pathname ?? "") + "?" + createQueryString("type", val ?? ""))}
        >
          <SelectTrigger className="w-[130px] bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
          </SelectContent>
        </Select>

        <Select
          key={`status-${searchParams?.get("status") ?? "All"}`}
          defaultValue={searchParams?.get("status") ?? "All"}
          onValueChange={(val) => router.push((pathname ?? "") + "?" + createQueryString("status", val ?? ""))}
        >
          <SelectTrigger className="w-[130px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>

        <Select
          key={`price-${searchParams?.get("price") ?? "All"}`}
          defaultValue={searchParams?.get("price") ?? "All"}
          onValueChange={(val) => router.push((pathname ?? "") + "?" + createQueryString("price", val ?? ""))}
        >
          <SelectTrigger className="w-[130px] bg-background">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Prices</SelectItem>
            <SelectItem value="0-10L">0 – 10L</SelectItem>
            <SelectItem value="10L-50L">10L – 50L</SelectItem>
            <SelectItem value="50L+">50L+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
