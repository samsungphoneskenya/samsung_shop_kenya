import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderDetailClient } from "@/components/dashboard/order-detail-client";

export const metadata = {
  title: "Order details",
  description: "View and manage order",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to orders
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Order {order.order_number}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {order.created_at &&
            new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <OrderDetailClient order={order} items={items || []} />
    </div>
  );
}
