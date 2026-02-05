"use server";

import { createClient } from "@/lib/db/client";

export async function searchProducts(query: string) {
  const supabase = await createClient();

  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        title,
        slug,
        price,
        compare_at_price,
        images:product_images(url, is_primary)
      `
      )
      .eq("status", "published")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data;

    // Format results with primary image
    // return (data || []).map((product) => ({
    //   ...product,
    //   image:
    //     product.images?.find((img: any) => img.is_primary)?.url ||
    //     product.images?.[0]?.url,
    // }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
