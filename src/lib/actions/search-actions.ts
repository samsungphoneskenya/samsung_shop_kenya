"use server";

import { createClient } from "@/lib/db/client";

export type SearchResultProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  featured_image: string | null;
};

export async function searchProducts(
  query: string,
  limit: number = 8
): Promise<SearchResultProduct[]> {
  const supabase = await createClient();
  const q = query?.trim() ?? "";

  if (q.length < 2) return [];

  const safeQuery = q.replace(/%/g, "\\%").replace(/_/g, "\\_");

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, price, compare_at_price, featured_image")
      .eq("status", "published")
      .or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,short_description.ilike.%${safeQuery}%`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).filter(
      (r): r is SearchResultProduct =>
        typeof r?.id === "string" &&
        typeof r?.title === "string" &&
        typeof r?.slug === "string" &&
        typeof r?.price === "number"
    );
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
