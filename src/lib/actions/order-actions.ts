"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CreateOrderInput,
  UpdateOrderInput,
  UpdateOrderStatusInput,
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.schema";

type ActionResult = {
  error?: string;
  success?: boolean;
  orderId?: string;
  orderNumber?: string;
};

/**
 * Create a new order from the admin dashboard.
 * This is a simplified flow that lets staff quickly create an order
 * without going through the public checkout/cart.
 */
export async function createOrderFromDashboard(
  payload: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    delivery_location: string;
    delivery_notes?: string | null;
    payment_method: string;
    subtotal: number;
    tax_amount?: number;
    shipping_fee?: number;
  }
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const now = new Date();
    const orderNumber = `ADM-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getTime()}`;

    const total =
      payload.subtotal +
      (payload.tax_amount ?? 0) +
      (payload.shipping_fee ?? 0);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: payload.customer_name || "Customer",
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email?.trim() || null,
        delivery_location: payload.delivery_location,
        delivery_notes: payload.delivery_notes ?? null,
        subtotal: payload.subtotal,
        tax_amount: payload.tax_amount ?? 0,
        shipping_fee: payload.shipping_fee ?? 0,
        total,
        payment_method: payload.payment_method,
        payment_status: "pending",
        status: "pending",
        user_id: null,
      })
      .select("id, order_number")
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/orders");

    return {
      success: true,
      orderId: data.id,
      orderNumber: data.order_number,
    };
  } catch (error: any) {
    console.error("Create dashboard order error:", error);
    return {
      error: error.message || "Failed to create dashboard order",
    };
  }
}

/**
 * Create a new order (public - from checkout)
 */
export async function createOrder(
  data: CreateOrderInput
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const validated = createOrderSchema.parse(data);

    const orderPayload = {
      order_number: validated.order_number || "",
      customer_name: validated.customer_name || "Customer",
      customer_phone: validated.customer_phone,
      customer_email: validated.customer_email?.trim() || "",
      delivery_location: validated.delivery_location,
      delivery_lat: validated.delivery_lat ?? null,
      delivery_lng: validated.delivery_lng ?? null,
      delivery_place_id: validated.delivery_place_id || "",
      delivery_notes: validated.delivery_notes || "",
      subtotal: validated.subtotal,
      tax_amount: validated.tax ?? 0,
      shipping_fee: validated.shipping_fee ?? 0,
      total: validated.total,
      payment_method: validated.payment_method,
    };

    const itemsPayload = validated.items.map((item) => ({
      product_id: item.product_id,
      product_title: item.product_title,
      product_slug: item.product_slug,
      product_image: item.product_image || "",
      product_sku: item.product_sku || "",
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { data: result, error } = await supabase.rpc(
      "create_order_with_items",
      {
        p_order: orderPayload,
        p_items: itemsPayload,
      }
    );

    if (error) throw error;

    // Decrement inventory (best-effort, non-blocking)
    for (const item of validated.items) {
      try {
        await supabase.rpc("decrement_product_quantity", {
          product_id: item.product_id,
          quantity_to_remove: item.quantity,
        });
      } catch {
        // best-effort, ignore failures
      }
    }

    const { order_id, order_number } = result as {
      order_id: string;
      order_number: string;
    };

    // Link order to logged-in user so it appears in My Orders and can be reviewed
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from("orders")
        .update({ user_id: user.id })
        .eq("id", order_id);
    }

    return {
      success: true,
      orderId: order_id,
      orderNumber: order_number,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Create order error:", error);
    return { error: error.message || "Failed to create order" };
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusInput
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const validated = updateOrderStatusSchema.parse(data);

    const { error } = await supabase
      .from("orders")
      .update({ status: validated.status })
      .eq("id", orderId);

    if (error) throw error;

    // Add status history entry (always log who changed it)
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: validated.status,
      notes:
        validated.notes ||
        `Status changed to "${validated.status}" from dashboard`,
      created_by: user.id,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update order status error:", error);
    return {
      error: error.message || "Failed to update order status",
    };
  }
}

/**
 * Update order details (admin only)
 */
export async function updateOrder(
  orderId: string,
  data: UpdateOrderInput
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const validated = updateOrderSchema.parse(data);

    const { error } = await supabase
      .from("orders")
      .update(validated)
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update order error:", error);
    return {
      error: error.message || "Failed to update order",
    };
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    // Get order items to restore quantities
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) throw error;

    // Restore product quantities
    if (items) {
      for (const item of items) {
        await supabase.rpc("increment_product_quantity", {
          product_id: item.product_id ?? "",
          quantity_to_add: item.quantity ?? 0,
        });
      }
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return {
      error: error.message || "Failed to cancel order",
    };
  }
}

/**
 * Confirm M-Pesa payment (dashboard): set payment_status to paid and optional reference
 */
export async function confirmOrderPayment(
  orderId: string,
  paymentReference?: string | null
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  try {
    // Fetch existing state for audit logging
    const { data: existing, error: fetchError } = await supabase
      .from("orders")
      .select("status,payment_status,payment_reference")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    const updates: { payment_status: string; payment_reference?: string | null } = {
      payment_status: "paid",
      payment_reference: paymentReference ?? null,
    };

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (updateError) throw updateError;

    // Log payment change in status history, including who did it
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: existing?.status ?? "pending",
      notes: `Payment status changed from "${
        existing?.payment_status ?? "unknown"
      }" to "paid" via dashboard. M-Pesa reference: ${
        paymentReference || "N/A"
      }. Previous reference: ${existing?.payment_reference || "none"}.`,
      created_by: user.id,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Confirm order payment error:", error);
    return { error: error.message || "Failed to confirm payment" };
  }
}

/**
 * Mark WhatsApp notification as sent (stub: in future call WhatsApp API)
 */
export async function sendOrderWhatsApp(
  orderId: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ whatsapp_sent_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { success: true };
}

/**
 * Delete order (admin only - permanent)
 */
export async function deleteOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/orders");
  redirect("/dashboard/orders");
}
