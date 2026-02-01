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
    // Extract and validate data
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || null,
      price: parseFloat(formData.get("price") as string),
      compare_at_price: formData.get("compare_at_price")
        ? parseFloat(formData.get("compare_at_price") as string)
        : null,
      cost_price: formData.get("cost_price")
        ? parseFloat(formData.get("cost_price") as string)
        : null,
      sku: (formData.get("sku") as string) || null,
      barcode: (formData.get("barcode") as string) || null,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      category_id: (formData.get("category_id") as string) || null,
      status: formData.get("status") as "draft" | "published" | "archived",
      featured:
        formData.get("featured") === "on" || formData.get("featured") === "true"
          ? true
          : false,
      created_by: user.id,
      updated_by: user.id,
    };

    // Validate
    const validated = productInsertSchema.parse(data);

    // Check if slug exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", validated.slug)
      .single();

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

    // Create SEO metadata if provided
    const metaTitle = formData.get("meta_title") as string;
    const metaDescription = formData.get("meta_description") as string;
    const focusKeyword = formData.get("focus_keyword") as string;

    if (metaTitle || metaDescription || focusKeyword) {
      await supabase.from("seo_metadata").insert({
        entity_type: "product",
        entity_id: product.id,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        focus_keyword: focusKeyword || null,
      });
    }

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
  console.log("formData", formData);

  try {
    // Extract and validate data
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || null,
      price: parseFloat(formData.get("price") as string),
      compare_at_price: formData.get("compare_at_price")
        ? parseFloat(formData.get("compare_at_price") as string)
        : null,
      cost_price: formData.get("cost_price")
        ? parseFloat(formData.get("cost_price") as string)
        : null,
      sku: (formData.get("sku") as string) || null,
      barcode: (formData.get("barcode") as string) || null,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      category_id: (formData.get("category_id") as string) || null,
      status: formData.get("status") as "draft" | "published" | "archived",
      featured: formData.get("featured") === "on",
      updated_by: user.id,
    };

    // Validate
    const validated = productUpdateSchema.parse(data);
    console.log("validated", validated);

    // Check if slug is taken by another product
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", validated.slug!)
      .neq("id", productId)
      .single();

    if (existing) {
      return { error: "A product with this slug already exists" };
    }

    // Update product
    const { error } = await supabase
      .from("products")
      .update(validated)
      .eq("id", productId);

    if (error) throw error;

    // Update or create SEO metadata
    const metaTitle = formData.get("meta_title") as string;
    const metaDescription = formData.get("meta_description") as string;
    const focusKeyword = formData.get("focus_keyword") as string;

    if (metaTitle || metaDescription || focusKeyword) {
      const { data: existingSeo } = await supabase
        .from("seo_metadata")
        .select("id")
        .eq("entity_type", "product")
        .eq("entity_id", productId)
        .single();

      if (existingSeo) {
        // Update existing
        await supabase
          .from("seo_metadata")
          .update({
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
            focus_keyword: focusKeyword || null,
          })
          .eq("id", existingSeo.id);
      } else {
        // Create new
        await supabase.from("seo_metadata").insert({
          entity_type: "product",
          entity_id: productId,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          focus_keyword: focusKeyword || null,
        });
      }
    }

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
    .update({ status: newStatus, updated_by: user.id })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${productId}`);
}
