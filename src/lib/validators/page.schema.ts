import { z } from "zod";

export const pageInsertSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  content: z.string().optional().nullable(),
  status: z
    .enum(["draft", "published", "archived"])
    .default("draft")
    .optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  sections: z.record(z.string(), z.any()).nullable().optional(),
});

export const pageUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  sections: z.record(z.string(), z.any()).nullable().optional(),
});
