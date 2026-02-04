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
  created_by: z.string().uuid().optional().nullable(),
  updated_by: z.string().uuid().optional().nullable(),
});

export const pageUpdateSchema = pageInsertSchema.partial();
