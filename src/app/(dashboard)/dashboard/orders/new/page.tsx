import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { OrderCreateForm } from "@/components/dashboard/order-create-form";

export const metadata = {
  title: "Create order",
  description: "Create a manual order from the dashboard",
};

export default async function NewOrderPage() {
  await requireRole(["admin", "editor"]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 text-black">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create order
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manually create an order for a customer from the dashboard.
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to orders
        </Link>
      </div>

      <OrderCreateForm />
    </div>
  );
}

