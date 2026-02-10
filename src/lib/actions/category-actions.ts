"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  level: number;
  display_order: number;
  status: string;
  created_at: string;
};

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
  parent_name?: string;
  parent_slug?: string;
};

/**
 * Get all main categories (level 0 - no parent)
 */
export async function getMainCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .eq("status", "published")
    .order("display_order");

  if (error) {
    console.error("Error fetching main categories:", error);
    return [];
  }

  return data as Category[];
}

/**
 * Get subcategories for a parent category
 */
export async function getSubcategories(parentSlug: string) {
  const supabase = await createClient();

  // First get parent category
  const { data: parent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parentSlug)
    .single();

  if (!parent) return [];

  // Get children
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parent.id)
    .eq("status", "published")
    .order("display_order");

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }

  return data as Category[];
}

/**
 * Get complete category tree (hierarchical)
 */
export async function getCategoryTree() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "published")
    .order("level")
    .order("display_order");

  if (error) {
    console.error("Error fetching category tree:", error);
    return [];
  }

  // Build tree structure
  const categoriesMap = new Map<string, CategoryWithChildren>();
  const tree: CategoryWithChildren[] = [];

  // First pass: create map
  data.forEach((cat) => {
    categoriesMap.set(cat.id, { ...cat, children: [] });
  });

  // Second pass: build tree
  data.forEach((cat) => {
    const category = categoriesMap.get(cat.id)!;

    if (cat.parent_id) {
      const parent = categoriesMap.get(cat.parent_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(category);
      }
    } else {
      tree.push(category);
    }
  });

  return tree;
}

/**
 * Get category by slug with parent info
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      parent:categories!parent_id(id, name, slug)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data;
}

/**
 * Get products by category (including subcategories)
 */
export async function getProductsByCategory(
  categorySlug: string,
  includeSubcategories = true
) {
  const supabase = await createClient();

  // Get category
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!category) return [];

  let categoryIds = [category.id];

  // Get subcategories if requested
  if (includeSubcategories) {
    const { data: subcats } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id)
      .eq("status", "published");

    if (subcats && subcats.length > 0) {
      categoryIds = [...categoryIds, ...subcats.map((s) => s.id)];
    }
  }

  // Get products
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, name, slug)
    `
    )
    .eq("status", "published")
    .in("category_id", categoryIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Check if category has products
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    throw new Error(
      `Cannot delete category with ${count} products. Remove products first.`
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/categories");
}
