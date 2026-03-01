import { MetadataRoute } from "next";
import { createClient } from "@/lib/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://samsungphones.co.ke/";

  const supabase = await createClient();

  const [productsResult, pagesResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published"),
    supabase
      .from("pages")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published"),
    supabase
      .from("categories")
      .select("slug, updated_at, created_at, status")
      .eq("status", "published"),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const products = productsResult.data ?? [];
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.created_at ?? now),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const pages = pagesResult.data ?? [];
  const dynamicPages: MetadataRoute.Sitemap = pages
    .filter((p) => p.slug && p.slug !== "home")
    .map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.created_at ?? now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const categories = categoriesResult.data ?? [];
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${baseUrl}/shop?category=${encodeURIComponent(c.slug)}`,
      lastModified: new Date(c.updated_at ?? c.created_at ?? now),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticPages, ...productPages, ...dynamicPages, ...categoryPages];
}
