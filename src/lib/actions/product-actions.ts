"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  productInsertSchema,
  productUpdateSchema,
} from "@/lib/validators/product.schema";

type ActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Create a new product
 */
export async function createProduct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const isTruthy = (value: FormDataEntryValue | null) =>
      value === "on" || value === "true" || value === "1";

    // Extract and validate data
    const price = parseFloat(formData.get("price") as string);
    const compareAt = formData.get("compare_at_price")
      ? parseFloat(formData.get("compare_at_price") as string)
      : null;
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || null,
      short_description: (formData.get("short_description") as string) || null,
      price,
      compare_at_price: compareAt,
      cost_price: formData.get("cost_price")
        ? parseFloat(formData.get("cost_price") as string)
        : null,
      sku: (formData.get("sku") as string) || null,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      low_stock_threshold:
        parseInt(formData.get("low_stock_threshold") as string) || 5,
      track_inventory: isTruthy(formData.get("track_inventory")),
      allow_backorder: isTruthy(formData.get("allow_backorder")),
      category_id: (formData.get("category_id") as string) || null,
      status: formData.get("status") as
        | "draft"
        | "published"
        | "archived"
        | "out_of_stock",
      visibility: (formData.get("visibility") as
        | "visible"
        | "hidden"
        | "search_only"
        | null) ?? null,
      is_featured: isTruthy(formData.get("is_featured")),
      is_bestseller: isTruthy(formData.get("is_bestseller")),
      is_new_arrival: isTruthy(formData.get("is_new_arrival")),
      on_sale:
        isTruthy(formData.get("on_sale")) ||
        (typeof compareAt === "number" && compareAt > price),
      featured_image: (formData.get("featured_image") as string) || null,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: (formData.get("meta_description") as string) || null,
      meta_keywords: (formData.get("meta_keywords") as string)
        ? (formData.get("meta_keywords") as string)
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : null,
      published_at:
        formData.get("status") === "published" ? new Date().toISOString() : null,
    };

    // Validate
    const validated = productInsertSchema.parse(data);

    // Check if slug exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", validated.slug)
      .maybeSingle();

    if (existing) {
      return { error: "A product with this slug already exists" };
    }

    // Create product
    const { data: product, error } = await supabase
      .from("products")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/products");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Create product error:", error);
    return { error: error.message || "Failed to create product" };
  } finally {
    redirect("/dashboard/products");
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const isTruthy = (value: FormDataEntryValue | null) =>
      value === "on" || value === "true" || value === "1";

    // Extract and validate data
    const price = parseFloat(formData.get("price") as string);
    const compareAt = formData.get("compare_at_price")
      ? parseFloat(formData.get("compare_at_price") as string)
      : null;
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || null,
      short_description: (formData.get("short_description") as string) || null,
      price,
      compare_at_price: compareAt,
      cost_price: formData.get("cost_price")
        ? parseFloat(formData.get("cost_price") as string)
        : null,
      sku: (formData.get("sku") as string) || null,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      low_stock_threshold:
        parseInt(formData.get("low_stock_threshold") as string) || 5,
      track_inventory: isTruthy(formData.get("track_inventory")),
      allow_backorder: isTruthy(formData.get("allow_backorder")),
      category_id: (formData.get("category_id") as string) || null,
      status: formData.get("status") as
        | "draft"
        | "published"
        | "archived"
        | "out_of_stock",
      visibility: (formData.get("visibility") as
        | "visible"
        | "hidden"
        | "search_only"
        | null) ?? null,
      is_featured: isTruthy(formData.get("is_featured")),
      is_bestseller: isTruthy(formData.get("is_bestseller")),
      is_new_arrival: isTruthy(formData.get("is_new_arrival")),
      on_sale:
        isTruthy(formData.get("on_sale")) ||
        (typeof compareAt === "number" && compareAt > price),
      featured_image: (formData.get("featured_image") as string) || null,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: (formData.get("meta_description") as string) || null,
      meta_keywords: (formData.get("meta_keywords") as string)
        ? (formData.get("meta_keywords") as string)
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : null,
      published_at:
        formData.get("status") === "published" ? new Date().toISOString() : null,
    };

    // Validate
    const validated = productUpdateSchema.parse(data);

    // Check if slug is taken by another product
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", validated.slug!)
      .neq("id", productId)
      .maybeSingle();

    if (existing) {
      return { error: "A product with this slug already exists" };
    }

    // Update product
    const { error } = await supabase
      .from("products")
      .update(validated)
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update product error:", error);
    return { error: error.message || "Failed to update product" };
  } finally {
    redirect("/dashboard/products");
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

/**
 * Toggle product status (publish/unpublish)
 */
export async function toggleProductStatus(
  productId: string,
  currentStatus: string
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const newStatus = currentStatus === "published" ? "draft" : "published";

  const { error } = await supabase
    .from("products")
    .update({
      status: newStatus,
      published_at: newStatus === "published" ? new Date().toISOString() : null,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${productId}`);
}
