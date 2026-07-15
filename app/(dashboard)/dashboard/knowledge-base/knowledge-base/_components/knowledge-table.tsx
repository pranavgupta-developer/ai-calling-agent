"use client";

import { useState } from "react";
import { format } from "date-fns";
import { KnowledgeBaseEntry } from "@/types/knowledge-base";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { KnowledgeForm } from "./knowledge-form";
import { DeleteDialog } from "./delete-dialog";
import { toggleKnowledgeStatus, softDeleteKnowledgeEntry } from "@/app/actions/knowledge-base";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface KnowledgeTableProps {
  entries: KnowledgeBaseEntry[];
  totalPages: number;
  currentPage: number;
}

export function KnowledgeTable({ entries, totalPages, currentPage }: KnowledgeTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleKnowledgeStatus(id, currentStatus);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(currentStatus ? "Entry deactivated" : "Entry activated");
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const result = await softDeleteKnowledgeEntry(deletingId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Entry deleted successfully");
      setDeletingId(null);
    } catch (error) {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed text-center">
        <h3 className="text-lg font-semibold">No knowledge entries found.</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Create your first FAQ to help the AI answer client questions.
        </p>
        <KnowledgeForm />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <div className="grid grid-cols-12 border-b bg-muted/50 p-4 font-medium text-sm text-muted-foreground">
          <div className="col-span-4">Question</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Source / Priority</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 p-4 items-center gap-4 text-sm hover:bg-muted/30 transition-colors">
              <div className="col-span-4">
                <div className="font-medium line-clamp-1">{entry.question}</div>
                <div className="text-muted-foreground line-clamp-1 text-xs mt-1">{entry.answer}</div>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className="truncate max-w-[120px]">
                  {entry.category}
                </Badge>
              </div>
              <div className="col-span-2 flex flex-col gap-1 items-start">
                <Badge variant={entry.source === "system" ? "secondary" : "default"} className="text-[10px]">
                  {entry.source.toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground font-mono">P: {entry.priority}</div>
              </div>
              <div className="col-span-1">
                <Switch 
                  checked={entry.is_active} 
                  onCheckedChange={() => handleToggleStatus(entry.id, entry.is_active)}
                  aria-label="Toggle active status"
                />
              </div>
              <div className="col-span-2 text-muted-foreground text-xs">
                {format(new Date(entry.updated_at), "MMM d, yyyy")}
              </div>
              <div className="col-span-1 text-right">
                <ActionMenu 
                  entry={entry} 
                  onDelete={() => setDeletingId(entry.id)} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-medium">{entry.question}</h4>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{entry.category}</Badge>
                  <Badge variant={entry.source === "system" ? "secondary" : "default"}>
                    {entry.source}
                  </Badge>
                </div>
              </div>
              <ActionMenu 
                entry={entry} 
                onDelete={() => setDeletingId(entry.id)} 
              />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{entry.answer}</p>
            <div className="flex items-center justify-between pt-2 border-t text-sm">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={entry.is_active} 
                  onCheckedChange={() => handleToggleStatus(entry.id, entry.is_active)}
                />
                <span className="text-muted-foreground">{entry.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className="text-muted-foreground text-xs">
                {format(new Date(entry.updated_at), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(createPageURL(currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(createPageURL(currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <DeleteDialog
        isOpen={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

function ActionMenu({ entry, onDelete }: { entry: KnowledgeBaseEntry; onDelete: () => void }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <KnowledgeForm 
        initialData={entry}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
