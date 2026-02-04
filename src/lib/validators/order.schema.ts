import { Database } from "@/types/database.types";
import { z } from "zod";

// Order status types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cash_on_delivery" | "mpesa" | "card";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type OrderStatusHistory =
  Database["public"]["Tables"]["order_status_history"]["Row"];

export type OrderWithItems = Order & {
  items: OrderItem[];
  status_history?: OrderStatusHistory[];
};

// Validation schemas
export const googleMapsLocationSchema = z.object({
  formatted_address: z.string(),
  place_id: z.string().optional(),
  geometry: z
    .object({
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    })
    .optional(),
});

export const createOrderSchema = z.object({
  // Customer info
  order_number: z.string().min(1, "Order Number must be added").max(200),
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  customer_phone: z.string().min(10, "Please enter a valid phone number"),
  customer_email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  // Delivery address
  delivery_location: z.string().min(5, "Please enter a delivery address"),
  delivery_lat: z.number().optional(),
  delivery_lng: z.number().optional(),
  delivery_place_id: z.string().optional(),
  delivery_notes: z.string().optional(),

  // Order details
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  shipping_fee: z.number().min(0).default(0),
  total: z.number().min(0),

  // Payment
  payment_method: z.enum(["cash_on_delivery", "mpesa", "card"]),

  // Items
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        product_title: z.string(),
        product_slug: z.string(),
        product_image: z.string().optional(),
        product_sku: z.string().optional(),
        unit_price: z.number().min(0),
        quantity: z.number().min(1),
        subtotal: z.number().min(0),
      })
    )
    .min(1, "Order must have at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  notes: z.string().optional(),
});

export const updateOrderSchema = z.object({
  customer_name: z.string().min(2).optional(),
  customer_phone: z.string().min(10).optional(),
  customer_email: z.string().email().optional().or(z.literal("")),
  delivery_location: z.string().min(5).optional(),
  delivery_notes: z.string().optional(),
  tracking_number: z.string().optional(),
  estimated_delivery: z.string().optional(),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
