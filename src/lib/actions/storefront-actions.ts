"use server";

import { createClient } from "@/lib/db/client";
import type { Database } from "@/types/database.types";

type ProductsWithDetailsRow =
  Database["public"]["Views"]["products_with_details"]["Row"];

export type ProductSpecification =
  Database["public"]["Tables"]["product_specifications"]["Row"];

export type ProductReview =
  Database["public"]["Tables"]["product_reviews"]["Row"];

/**
 * Storefront-facing product shape.
 * Backed by the `products_with_details` view (see migrations).
 */
export type StorefrontProduct = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  /** Primary SEO title override for detail pages */
  meta_title: string | null;
  /** SEO meta description for search and social */
  meta_description: string | null;
  /** Optional keyword hints – useful for advanced SEO tooling */
  meta_keywords: string[] | null;
  price: number;
  compare_at_price: number | null;
  featured_image: string | null;
  gallery_images: string[] | null;
  status: string | null;
  created_at: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_arrival: boolean | null;
  on_sale: boolean | null;
  avg_rating: number | null;
  review_count: number | null;
  discount_percentage: number | null;
  stock_status: string | null;
  // Additional product metadata useful for details/specs views
  sku: string | null;
  weight: number | null;
  dimensions: ProductsWithDetailsRow["dimensions"];
  requires_shipping: boolean | null;
  shipping_class: string | null;
  allow_backorder: boolean | null;
  track_inventory: boolean | null;
  quantity: number | null;
  low_stock_threshold: number | null;
  visibility: string | null;
  published_at: string | null;
  updated_at: string | null;
  video_url: string | null;
};

function toStorefrontProducts(
  rows: ProductsWithDetailsRow[] | null
): StorefrontProduct[] {
  // Rows coming from generated types mark `id` as nullable.
  // For storefront rendering we drop nulls defensively.
  return (rows ?? [])
    .filter(
      (
        r
      ): r is ProductsWithDetailsRow & {
        id: string;
        title: string;
        slug: string;
        price: number;
      } =>
        typeof r.id === "string" &&
        typeof r.title === "string" &&
        typeof r.slug === "string" &&
        typeof r.price === "number"
    )
    .map((r) => ({
      ...(r as unknown as Omit<StorefrontProduct, "id" | "title" | "slug" | "price">),
      id: r.id,
      title: r.title,
      slug: r.slug,
      price: r.price,
    }));
}

/**
 * Get best selling products
 * TODO: Track sales count when order system is complete
 * For now, returns `is_bestseller` products (falls back to `is_featured`)
 */
export async function getBestSellers(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products_with_details")
    .select("*")
    .eq("status", "published")
    .or("is_bestseller.eq.true,is_featured.eq.true")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }

  return toStorefrontProducts(data);
}

/**
 * Get new arrival products (recently added)
 */
export async function getNewArrivals(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products_with_details")
    .select("*")
    .eq("status", "published")
    // Prefer explicit flag if present, but still keep newest ordering.
    .order("is_new_arrival", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }

  return toStorefrontProducts(data);
}

/**
 * Get products on sale
 */
export async function getOnSaleProducts(limit: number = 8) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products_with_details")
    .select("*")
    .eq("status", "published")
    // In this schema we model "sale" via `on_sale` + `compare_at_price`.
    .eq("on_sale", true)
    .not("compare_at_price", "is", null)
    .order("discount_percentage", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }

  return toStorefrontProducts(data);
}

/**
 * Get all published products with optional filtering
 */
export async function getProducts(options?: {
  category?: string;
  /** Filter by category slug (e.g. "galaxy-s-series"). Use this for URL params. */
  categorySlug?: string;
  featured?: boolean;
  /** Text search in title, description, short_description */
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products_with_details")
    .select("*")
    .eq("status", "published");

  if (options?.category) {
    query = query.eq("category_id", options.category);
  }

  if (options?.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }

  if (options?.featured !== undefined) {
    query = query.eq("is_featured", options.featured);
  }

  if (options?.search?.trim()) {
    const s = options.search.trim().replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(
      `title.ilike.%${s}%,description.ilike.%${s}%,short_description.ilike.%${s}%`
    );
  }

  if (options?.minPrice != null && options.minPrice >= 0) {
    query = query.gte("price", options.minPrice);
  }
  if (options?.maxPrice != null && options.maxPrice >= 0) {
    query = query.lte("price", options.maxPrice);
  }

  switch (options?.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset != null) {
    const limit = options.limit ?? 24;
    query = query.range(options.offset, options.offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return toStorefrontProducts(data);
}

/**
 * Get single product by slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products_with_details")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  const [product] = toStorefrontProducts(data ? [data] : null);
  return product ?? null;
}

/**
 * Get structured specifications for a product.
 */
export async function getProductSpecifications(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_specifications")
    .select("*")
    .eq("product_id", productId)
    .order("group_order", { ascending: true })
    .order("spec_order", { ascending: true });

  if (error) {
    console.error("Error fetching product specifications:", error);
    return [] as ProductSpecification[];
  }

  return (data ?? []) as ProductSpecification[];
}

/**
 * Get approved reviews for a product.
 */
export async function getProductReviews(
  productId: string,
  options?: { limit?: number }
) {
  const supabase = await createClient();
  const limit = options?.limit ?? 20;

  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching product reviews:", error);
    return [] as ProductReview[];
  }

  return (data ?? []) as ProductReview[];
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
    .from("products_with_details")
    .select("*")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return toStorefrontProducts(data);
}
