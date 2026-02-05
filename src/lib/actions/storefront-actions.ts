"use server";

import { createClient } from "@/lib/db/client";

export type ProductWithImages = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  quantity: number;
  featured: boolean;
  status: string;
  created_at: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: {
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }[];
};

/**
 * Get best selling products
 * TODO: Track sales count when order system is complete
 * For now, returns featured products
 */
export async function getBestSellers(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `
    )
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }

  return data;
}

/**
 * Get new arrival products (recently added)
 */
export async function getNewArrivals(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }

  return data;
}

/**
 * Get products on sale
 */
export async function getOnSaleProducts(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `
    )
    .eq("status", "published")
    .not("sale_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }

  return data;
}

/**
 * Get all published products with optional filtering
 */
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `
    )
    .eq("status", "published");

  if (options?.category) {
    query = query.eq("category_id", options.category);
  }

  if (options?.featured !== undefined) {
    query = query.eq("featured", options.featured);
  }

  query = query.order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
}

/**
 * Get single product by slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary, position),
      seo_metadata(*)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data;
}

/**
 * Get related products (same category)
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug),
      images:product_images(url, alt_text, is_primary)
    `
    )
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .limit(limit);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return data;
}
