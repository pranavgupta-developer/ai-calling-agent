import * as z from 'zod';

export const KnowledgeCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
});

export const KnowledgeEntrySchema = z.object({
  category_id: z.string().uuid('Invalid category').nullable().optional(),
  question: z.string().min(5, 'Question must be at least 5 characters').max(500, 'Question must be 500 characters or less'),
  answer: z.string().min(5, 'Answer must be at least 5 characters').max(5000, 'Answer must be 5000 characters or less'),
  keywords: z.array(z.string()),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  is_ai_enabled: z.boolean(),
  confidence_score: z.number().min(0).max(1).optional().nullable(),
  language: z.string(),
  source_type: z.enum(['DEFAULT_FAQ', 'CUSTOM_FAQ', 'IMPORTED', 'LEARNED']),
  notes: z.string().max(1000).optional().nullable(),
  service_ids: z.array(z.string().uuid()),
  listing_ids: z.array(z.string().uuid()),
});

export type KnowledgeCategoryFormValues = z.infer<typeof KnowledgeCategorySchema>;
export type KnowledgeEntryFormValues = z.infer<typeof KnowledgeEntrySchema>;
