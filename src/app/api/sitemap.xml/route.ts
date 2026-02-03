import { createClient } from "@/lib/db/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  // Get all published content
  const [productsResult, pagesResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "published"),
    supabase.from("pages").select("slug, updated_at").eq("status", "published"),
    supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("status", "published"),
  ]);

  const products = productsResult.data || [];
  const pages = pagesResult.data || [];
  const categories = categoriesResult.data || [];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Products -->
  ${products
    .map(
      (product) => `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${
      product.updated_at && new Date(product.updated_at).toISOString()
    }</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}

  <!-- Categories -->
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${
      category.updated_at && new Date(category.updated_at).toISOString()
    }</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}

  <!-- Pages -->
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${
      page.updated_at && new Date(page.updated_at).toISOString()
    }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
