import { z } from "zod";

export const pricingTypeEnum = z.enum([
  "FREE",
  "FIXED",
  "HOURLY",
  "COMMISSION",
  "PERCENTAGE",
  "RANGE",
]);

const baseServiceSchema = z.object({
  template_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2, "Service name must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  category: z.string().optional(),
  pricing_type: pricingTypeEnum.default("FIXED"),
  fixed_price: z.coerce.number().min(0, "Fixed price cannot be negative").optional().nullable(),
  min_price: z.coerce.number().min(0, "Minimum price cannot be negative").optional().nullable(),
  max_price: z.coerce.number().min(0, "Maximum price cannot be negative").optional().nullable(),
  currency: z.string().default("INR"),
  duration_minutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute").optional().nullable(),
  active: z.boolean().default(true),
});

const priceRangeRefinement = (data: any) => {
  if (data.pricing_type === "RANGE") {
    if (data.min_price != null && data.max_price != null) {
      return data.min_price <= data.max_price;
    }
  }
  return true;
};

export const createServiceSchema = baseServiceSchema.refine(priceRangeRefinement, {
  message: "Minimum price cannot be greater than Maximum price.",
  path: ["max_price"],
});

export const updateServiceSchema = baseServiceSchema.partial().refine(priceRangeRefinement, {
  message: "Minimum price cannot be greater than Maximum price.",
  path: ["max_price"],
});

export type CreateServiceValues = z.infer<typeof createServiceSchema>;
export type UpdateServiceValues = z.infer<typeof updateServiceSchema>;
