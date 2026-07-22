'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Copy, Trash2, Eye, BrainCircuit, Activity } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KnowledgeEntry } from '../types';
import { deleteEntry } from '../actions/entries';
import { toast } from 'sonner';

interface EntriesClientProps {
  entries: KnowledgeEntry[];
}

export function EntriesClient({ entries }: EntriesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredEntries = entries.filter((entry) => 
    entry.question.toLowerCase().includes(search.toLowerCase()) || 
    entry.answer.toLowerCase().includes(search.toLowerCase()) ||
    (entry.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const res = await deleteEntry(id);
      if (res.success) {
        toast.success('Entry deleted successfully');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete entry');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'INACTIVE': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'DRAFT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search entries..." 
            className="pl-9 bg-background/50 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link href="/dashboard/knowledge-base/new" className={buttonVariants({ className: 'w-full sm:w-auto' })}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>AI Status</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No knowledge entries found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="group">
                  <TableCell className="font-medium">
                    <div className="line-clamp-2" title={entry.question}>
                      {entry.question}
                    </div>
                  </TableCell>
                  <TableCell>
                    {entry.category ? (
                      <Badge variant="outline" style={{ borderColor: entry.category.color || undefined, color: entry.category.color || undefined }}>
                        {entry.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(entry.priority)}>
                      {entry.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.is_ai_enabled ? (
                      <div className="flex items-center text-emerald-500 text-xs font-medium">
                        <BrainCircuit className="h-3 w-3 mr-1" />
                        Enabled
                      </div>
                    ) : (
                      <div className="flex items-center text-muted-foreground text-xs font-medium">
                        <BrainCircuit className="h-3 w-3 mr-1" />
                        Disabled
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end text-muted-foreground text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      {entry.usage_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity' })}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/knowledge-base/${entry.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/knowledge-base/${entry.id}/edit`)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/knowledge-base/new?duplicate=${entry.id}`)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
