'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { KnowledgeEntryFormValues, KnowledgeEntrySchema } from '../schemas';
import { createEntry, updateEntry } from '../actions/entries';
import { KnowledgeCategory } from '../types';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, BrainCircuit } from 'lucide-react';

interface EntryFormProps {
  categories: KnowledgeCategory[];
  initialData?: any;
}

export function EntryForm({ categories, initialData }: EntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const isEdit = !!initialData?.id;

  const form = useForm<KnowledgeEntryFormValues>({
    resolver: zodResolver(KnowledgeEntrySchema),
    defaultValues: {
      category_id: initialData?.category_id || '',
      question: initialData?.question || '',
      answer: initialData?.answer || '',
      keywords: initialData?.keywords || [],
      priority: initialData?.priority || 'MEDIUM',
      status: initialData?.status || 'ACTIVE',
      is_ai_enabled: initialData?.is_ai_enabled ?? true,
      confidence_score: initialData?.confidence_score || 0.8,
      language: initialData?.language || 'en',
      source_type: initialData?.source_type || 'CUSTOM_FAQ',
      notes: initialData?.notes || '',
      service_ids: initialData?.service_ids || [],
      listing_ids: initialData?.listing_ids || [],
    },
  });

  const onSubmit = async (data: KnowledgeEntryFormValues) => {
    setIsSubmitting(true);
    try {
      const res = isEdit 
        ? await updateEntry(initialData.id, data)
        : await createEntry(data);

      if (res.success) {
        toast.success(`Entry ${isEdit ? 'updated' : 'created'} successfully`);
        router.push('/dashboard/knowledge-base');
        router.refresh();
      } else {
        toast.error(res.error || 'Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const currentKeywords = form.getValues('keywords');
      const newKeyword = keywordInput.trim().toLowerCase();
      
      if (newKeyword && !currentKeywords.includes(newKeyword)) {
        form.setValue('keywords', [...currentKeywords, newKeyword]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const currentKeywords = form.getValues('keywords');
    form.setValue('keywords', currentKeywords.filter(k => k !== keywordToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Main Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-none">Knowledge Content</h3>
              <p className="text-sm text-muted-foreground">The actual content the AI will learn and use.</p>
            </div>

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Question / Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. What documents do I need to buy a house?" {...field} />
                  </FormControl>
                  <FormDescription>
                    The primary question or statement this entry addresses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Answer / Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the detailed answer..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The information the AI will use to formulate its response. Be clear and factual.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Type a keyword and press Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Helps the AI retrieve this entry when semantic search isn't confident.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-none">Settings & Metadata</h3>
              <p className="text-sm text-muted-foreground">Configuration for retrieval and organization.</p>
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_ai_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-emerald-500" />
                      Enable AI Retrieval
                    </FormLabel>
                    <FormDescription>
                      Allow the AI agent to use this entry in conversations.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional notes for your team (AI won't see this)" 
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard/knowledge-base')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Entry')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
