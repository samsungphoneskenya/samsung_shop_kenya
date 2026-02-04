import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { OrdersTable } from "@/components/dashboard/orders-table";

export const metadata = {
  title: "Orders",
  description: "Manage customer orders",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.search) {
    query = query.or(
      `order_number.ilike.%${searchParams.search}%,customer_name.ilike.%${searchParams.search}%,customer_phone.ilike.%${searchParams.search}%`
    );
  }

  const { data: orders, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const totalPages = Math.ceil((count || 0) / limit);

  // Get stats
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: processingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "processing");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all customer orders and track their status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {pendingCount || 0} Pending
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {processingCount || 0} Processing
          </span>
        </div>
      </div>

      <OrdersTable
        orders={orders || []}
        totalCount={count || 0}
        currentPage={page}
        totalPages={totalPages}
        currentStatus={searchParams.status}
        currentSearch={searchParams.search}
      />
    </div>
  );
}
