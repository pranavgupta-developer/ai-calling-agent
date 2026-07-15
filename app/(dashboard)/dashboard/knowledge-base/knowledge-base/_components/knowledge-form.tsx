"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KnowledgeBaseFormData, knowledgeBaseSchema } from "@/lib/validations/knowledge-base";
import { createKnowledgeEntry, updateKnowledgeEntry } from "@/app/actions/knowledge-base";
import { KnowledgeBaseEntry } from "@/types/knowledge-base";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "./tag-input";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

interface KnowledgeFormProps {
  initialData?: KnowledgeBaseEntry;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const defaultCategories = [
  "Buying", "Selling", "Renting", "Commercial", "Residential", 
  "Investment", "Financing", "Mortgage", "Legal", "Documentation", 
  "Property Viewing", "Pricing", "Property Management", "Amenities", 
  "Neighborhood", "Maintenance", "General"
];

export function KnowledgeForm({ initialData, trigger, open: externalOpen, onOpenChange }: KnowledgeFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled && onOpenChange ? onOpenChange : setInternalOpen;
  
  const form = useForm<KnowledgeBaseFormData>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      question: initialData.question,
      answer: initialData.answer,
      category: initialData.category,
      tags: initialData.tags,
      priority: initialData.priority,
      is_active: initialData.is_active,
    } : {
      question: "",
      answer: "",
      category: "",
      tags: [],
      priority: 0,
      is_active: true,
    },
  });

  const isEditing = !!initialData;

  const onSubmit = async (data: KnowledgeBaseFormData) => {
    try {
      let result;
      if (isEditing && data.id) {
        result = await updateKnowledgeEntry(data.id, data);
      } else {
        result = await createKnowledgeEntry(data);
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Entry ${isEditing ? 'updated' : 'created'} successfully!`);
      setOpen(false);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      {!trigger && !isControlled && (
        <SheetTrigger asChild>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Knowledge Entry</Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? "Edit Knowledge Entry" : "Create Knowledge Entry"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update your FAQ or knowledge entry here." : "Add a new FAQ or knowledge entry for your agency."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. What is the standard commission rate?" {...field} />
                  </FormControl>
                  <FormDescription>
                    10 to 300 characters. Keep it concise.
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
                  <FormLabel>Answer *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed explanation goes here..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    20 to 5000 characters. Provide a comprehensive answer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
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
                    <FormLabel>Priority (0-100)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} max={100}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Higher priority appears first.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput 
                      tags={field.value} 
                      onChange={field.onChange}
                      maxTags={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      If inactive, it won't be used by the AI retrieval engine.
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
