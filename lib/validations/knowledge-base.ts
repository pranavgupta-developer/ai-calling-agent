import { z } from "zod";

export const knowledgeBaseSchema = z.object({
  id: z.string().uuid().optional(),
  question: z
    .string()
    .trim()
    .min(10, "Question must be at least 10 characters")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string()
    .trim()
    .min(20, "Answer must be at least 20 characters")
    .max(5000, "Answer cannot exceed 5000 characters"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required"),
  tags: z
    .array(
      z.string().trim().min(2, "Tag must be at least 2 characters").max(30, "Tag cannot exceed 30 characters")
    )
    .max(20, "Maximum 20 tags allowed"),
  priority: z
    .number()
    .min(0, "Priority cannot be negative")
    .max(100, "Priority cannot exceed 100"),
  is_active: z.boolean(),
});

export type KnowledgeBaseFormData = z.infer<typeof knowledgeBaseSchema>;
export type CreateKnowledgeBaseInput = KnowledgeBaseFormData;
export type UpdateKnowledgeBaseInput = Partial<KnowledgeBaseFormData>;
export type KnowledgeBaseSource = "custom" | "system" | "imported" | "all";

export const searchKnowledgeBaseSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  source: z.enum(["custom", "system", "imported", "all"]).optional().default("all"),
  sort: z.enum(["newest", "oldest", "highest_priority", "lowest_priority"]).optional().default("newest"),
});

export type SearchKnowledgeBaseQuery = z.infer<typeof searchKnowledgeBaseSchema>;
