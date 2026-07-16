"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function KnowledgeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant UI update before URL push
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // reset to page 1 on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(pathname + "?" + createQueryString(key, value));
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("q", query);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row items-center justify-between bg-card p-4 rounded-lg border">
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search questions, answers, tags..."
          className="pl-9 w-full bg-background"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Select
          value={searchParams.get("category") || ""}
          onValueChange={(val) => handleFilterChange("category", val === "all" ? "" : (val || ""))}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Buying">Buying</SelectItem>
            <SelectItem value="Selling">Selling</SelectItem>
            <SelectItem value="Renting">Renting</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Investment">Investment</SelectItem>
            <SelectItem value="Financing">Financing</SelectItem>
            <SelectItem value="Mortgage">Mortgage</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="Documentation">Documentation</SelectItem>
            <SelectItem value="Property Viewing">Property Viewing</SelectItem>
            <SelectItem value="Pricing">Pricing</SelectItem>
            <SelectItem value="Property Management">Property Management</SelectItem>
            <SelectItem value="Amenities">Amenities</SelectItem>
            <SelectItem value="Neighborhood">Neighborhood</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") || "active"}
          onValueChange={(val) => handleFilterChange("status", val || "")}
        >
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("source") || "all"}
          onValueChange={(val) => handleFilterChange("source", val || "")}
        >
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="system">System (Seed)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(val) => handleFilterChange("sort", val || "newest")}
        >
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest_priority">Highest Priority</SelectItem>
            <SelectItem value="lowest_priority">Lowest Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
