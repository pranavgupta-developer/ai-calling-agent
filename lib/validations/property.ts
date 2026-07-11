import * as z from "zod";

export const propertyFormSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters long.",
    })
    .trim(),

  description: z
    .string()
    .min(20, {
      message: "Description must be at least 20 characters long.",
    })
    .trim(),

  property_type: z.enum([
    "apartment",
    "house",
    "villa",
    "commercial",
    "office",
    "land",
  ]),

  listing_type: z.enum([
    "sale",
    "rental",
  ]),

  status: z.enum([
    "available",
    "pending",
    "sold",
  ]).default("available"),

  price: z.coerce
    .number()
    .positive({
      message: "Price must be a positive number.",
    }),

  price_type: z.enum([
    "fixed",
    "monthly",
  ]),

  bedrooms: z.coerce
    .number()
    .int()
    .min(0, {
      message: "Bedrooms cannot be negative.",
    }),

  bathrooms: z.coerce
    .number()
    .int()
    .min(0, {
      message: "Bathrooms cannot be negative.",
    }),

  parking: z.coerce
    .number()
    .int()
    .min(0, {
      message: "Parking spots cannot be negative.",
    }),

  square_feet: z.coerce
    .number()
    .positive({
      message: "Square feet must be positive.",
    }),

  year_built: z.coerce
    .number()
    .int()
    .min(1800, {
      message: "Year built must be 1800 or later.",
    })
    .max(new Date().getFullYear(), {
      message: "Year built cannot be in the future.",
    }),

  amenities: z.array(z.string()).default([]),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;