import { z } from "zod";

// Product schemas
export const productInsertSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  featured_image: z.string().nullable().optional(),
  gallery_images: z.array(z.string()).nullable().optional(),
  price: z.number().min(0, "Price must be 0 or more"),
  status: z
    .enum(["draft", "published", "archived", "out_of_stock"])
    .default("draft"),
  visibility: z.enum(["visible", "hidden", "search_only"]).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  sku: z.string().nullable().optional(),
  compare_at_price: z.number().min(0).nullable().optional(),
  cost_price: z.number().min(0).nullable().optional(),
  quantity: z.number().int().min(0).nullable().optional(),
  low_stock_threshold: z.number().int().min(0).nullable().optional(),
  track_inventory: z.boolean().nullable().optional(),
  allow_backorder: z.boolean().nullable().optional(),
  is_featured: z.boolean().nullable().optional(),
  is_bestseller: z.boolean().nullable().optional(),
  is_new_arrival: z.boolean().nullable().optional(),
  on_sale: z.boolean().nullable().optional(),
  weight: z.number().min(0).nullable().optional(),
  dimensions: z.any().nullable().optional(),
  requires_shipping: z.boolean().nullable().optional(),
  shipping_class: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  meta_keywords: z.array(z.string()).nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export const productUpdateSchema = productInsertSchema.partial();

export const productQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// SEO metadata schemas
export const seoMetadataSchema = z.object({
  entity_type: z.enum(["product", "category", "page"]),
  entity_id: z.string().uuid(),
  meta_title: z.string().max(60).nullable().optional(),
  meta_description: z.string().max(160).nullable().optional(),
  og_title: z.string().max(60).nullable().optional(),
  og_description: z.string().max(160).nullable().optional(),
  og_image: z.string().url().nullable().optional(),
  canonical_url: z.string().url().nullable().optional(),
  robots: z.string().nullable().optional(),
  structured_data: z.any().nullable().optional(),
});

export const seoMetadataUpdateSchema = seoMetadataSchema.partial().omit({
  entity_type: true,
  entity_id: true,
});

// AI generation schemas
export const aiGenerateSEOSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(50),
  tone: z.enum(["professional", "casual", "technical"]).default("professional"),
  keywords: z.array(z.string()).optional(),
  overwrite: z.boolean().default(false),
});

export const aiGenerateDescriptionSchema = z.object({
  productId: z.string().uuid(),
  tone: z.enum(["professional", "casual", "technical"]).default("professional"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

// Types derived from schemas
export type ProductInsert = z.infer<typeof productInsertSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type SEOMetadataInsert = z.infer<typeof seoMetadataSchema>;
export type SEOMetadataUpdate = z.infer<typeof seoMetadataUpdateSchema>;
export type AIGenerateSEOInput = z.infer<typeof aiGenerateSEOSchema>;
export type AIGenerateDescriptionInput = z.infer<
  typeof aiGenerateDescriptionSchema
>;
