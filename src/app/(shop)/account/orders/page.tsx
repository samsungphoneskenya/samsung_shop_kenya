import { Metadata } from "next";
import Link from "next/link";
import { getCustomerOrders } from "@/lib/actions/account-actions";
import { OrderList } from "@/components/account/OrderList";

export const metadata: Metadata = {
  title: "My Orders | Samsung Shop Kenya",
  description: "View your order history",
};

export default async function AccountOrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order history</h2>
      {orders.length === 0 ? (
        <div>
          <p className="text-gray-500">You have no orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
            Browse shop
          </Link>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  );
}
