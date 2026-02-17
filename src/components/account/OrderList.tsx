import Link from "next/link";
import type { CustomerOrder } from "@/lib/actions/account-actions";

const COMPLETED_STATUSES = ["completed", "delivered"];

export function OrderList({ orders }: { orders: CustomerOrder[] }) {
  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-medium text-gray-900">#{order.order_number}</span>
              <span className="mx-2 text-gray-400">·</span>
              <span className="text-sm text-gray-500">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString()
                  : ""}
              </span>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                COMPLETED_STATUSES.includes(order.status)
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Total: KES {Number(order.total).toLocaleString()}
          </p>
          <Link
            href={`/account/orders/${order.id}`}
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View order
          </Link>
        </li>
      ))}
    </ul>
  );
}
