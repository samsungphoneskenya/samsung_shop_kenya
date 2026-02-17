"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser, getCurrentUserProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type CustomerOrder = OrderRow & { items?: OrderItemRow[] };

type ActionResult = { error?: string; success?: boolean };

const COMPLETED_STATUSES = ["completed", "delivered"];

/**
 * Require current user to be a customer; redirect or throw if not.
 * Call from account pages only.
 */
export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getCurrentUserProfile();
  if (!profile) return null;
  const staff = ["admin", "editor", "seo_manager"];
  if (staff.includes(profile.role ?? "")) return null;
  return { user, profile };
}

/**
 * Get orders for the current customer (user_id match).
 */
export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const ctx = await requireCustomer();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCustomerOrders:", error);
    return [];
  }
  return (data ?? []) as CustomerOrder[];
}

/**
 * Get one order with items for the current customer.
 */
export async function getCustomerOrder(
  orderId: string
): Promise<CustomerOrder | null> {
  const ctx = await requireCustomer();
  if (!ctx) return null;

  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", ctx.user.id)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { ...(order as OrderRow), items: (items ?? []) as OrderItemRow[] };
}

/**
 * Update current customer profile (full_name, phone).
 */
export async function updateCustomerProfile(
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireCustomer();
  if (!ctx) return { error: "Unauthorized" };

  const fullName = formData.get("fullName") as string | null;
  const phone = (formData.get("phone") as string | null) ?? undefined;

  const supabase = await createClient();
  const updates: Partial<ProfileRow> = {};
  if (typeof fullName === "string" && fullName.trim()) updates.full_name = fullName.trim();
  if (phone !== undefined) updates.phone = phone?.trim() || null;

  if (Object.keys(updates).length === 0) return { success: true };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", ctx.user.id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { success: true };
}

/**
 * Submit a product review. Allowed only if the user has a completed order containing that product.
 */
export async function submitProductReview(
  productId: string,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireCustomer();
  if (!ctx) return { error: "Unauthorized" };

  const rating = Number(formData.get("rating"));
  const title = (formData.get("title") as string)?.trim() ?? null;
  const comment = (formData.get("comment") as string)?.trim();
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a rating from 1 to 5." };
  }
  if (!comment || comment.length < 10) {
    return { error: "Review comment must be at least 10 characters." };
  }

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", ctx.user.id)
    .in("status", COMPLETED_STATUSES);

  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length === 0) {
    return { error: "You can only review products from orders that have been completed." };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id")
    .in("order_id", orderIds)
    .eq("product_id", productId)
    .limit(1);

  if (!items?.length) {
    return { error: "You can only review products from your completed orders." };
  }

  const { error: insertError } = await supabase.from("product_reviews").insert({
    product_id: productId,
    user_id: ctx.user.id,
    reviewer_name: ctx.profile.full_name ?? ctx.profile.email,
    reviewer_email: ctx.profile.email,
    rating,
    title: title || null,
    comment,
    status: "pending",
    is_verified_purchase: true,
  });

  if (insertError) return { error: insertError.message };
  revalidatePath("/account");
  revalidatePath("/account/orders");
  return { success: true };
}

/**
 * Get unique delivery addresses from the customer's orders (for future use).
 */
export async function getSavedAddresses(): Promise<
  { delivery_location: string; delivery_notes?: string | null }[]
> {
  const ctx = await requireCustomer();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("delivery_location, delivery_notes")
    .eq("user_id", ctx.user.id)
    .not("delivery_location", "is", null);

  if (error) return [];

  const seen = new Set<string>();
  const out: { delivery_location: string; delivery_notes?: string | null }[] = [];
  for (const row of data ?? []) {
    const loc = (row.delivery_location ?? "").trim();
    if (!loc || seen.has(loc)) continue;
    seen.add(loc);
    out.push({
      delivery_location: loc,
      delivery_notes: row.delivery_notes ?? undefined,
    });
  }
  return out;
}

/**
 * Check if the current customer has already reviewed a product.
 */
export async function hasCustomerReviewedProduct(
  productId: string
): Promise<boolean> {
  const ctx = await requireCustomer();
  if (!ctx) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", ctx.user.id)
    .limit(1);

  return !error && (data?.length ?? 0) > 0;
}
