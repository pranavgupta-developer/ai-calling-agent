import { z } from "zod";

export const knowledgeBaseSourceEnum = z.enum(["SYSTEM", "CUSTOM", "IMPORTED"]);

export const createKnowledgeBaseSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters").max(500, "Question must be less than 500 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters").max(10000, "Answer is too long"),
  category: z.string().min(2, "Category must be at least 2 characters").max(100, "Category is too long"),
  tags: z.array(z.string().max(50)).max(20, "Cannot have more than 20 tags").optional().default([]),
  searchKeywords: z.string().max(500, "Search keywords string is too long").optional(),
  source: knowledgeBaseSourceEnum.optional().default("CUSTOM"),
  displayOrder: z.number().int().min(0, "Display order must be a non-negative integer").optional().default(0),
  isActive: z.boolean().optional().default(true),
  isSystem: z.boolean().optional().default(false),
});

export const updateKnowledgeBaseSchema = createKnowledgeBaseSchema.partial();

export const searchKnowledgeBaseSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  sort: z.enum(["newest", "oldest", "display_order"]).optional().default("display_order"),
});

export type KnowledgeBaseSource = z.infer<typeof knowledgeBaseSourceEnum>;
export type CreateKnowledgeBaseInput = z.infer<typeof createKnowledgeBaseSchema>;
export type UpdateKnowledgeBaseInput = z.infer<typeof updateKnowledgeBaseSchema>;
export type SearchKnowledgeBaseQuery = z.infer<typeof searchKnowledgeBaseSchema>;
