import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerOrder } from "@/lib/actions/account-actions";
import { SafeImage } from "@/components/shared/SafeImage";
import { ReviewButton } from "@/components/account/ReviewButton";
import { hasCustomerReviewedProduct } from "@/lib/actions/account-actions";

export const metadata: Metadata = {
  title: "Order details | Samsung Shop Kenya",
  description: "View order details and leave a review",
};

const COMPLETED_STATUSES = ["completed", "delivered"];

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getCustomerOrder(id);
  if (!order) notFound();

  const canReview = COMPLETED_STATUSES.includes(order.status);
  const itemReviewStatus = await Promise.all(
    (order.items ?? []).map(async (item) => ({
      item,
      reviewed: item.product_id
        ? await hasCustomerReviewedProduct(item.product_id)
        : false,
    }))
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <Link
        href="/account/orders"
        className="text-sm font-medium text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to orders
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Order #{order.order_number}
        </h2>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            COMPLETED_STATUSES.includes(order.status)
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Placed on{" "}
        {order.created_at
          ? new Date(order.created_at).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })
          : ""}
      </p>
      <p className="text-gray-700 mb-6">
        Delivery: {order.delivery_location}
        {order.delivery_notes ? ` · ${order.delivery_notes}` : ""}
      </p>
      <p className="text-lg font-semibold text-gray-900 mb-2">Items</p>
      <ul className="space-y-4">
        {(order.items ?? []).map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-4 last:border-0"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <SafeImage
                src={item.product_image || "/images/logo.png"}
                alt={item.product_title}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.product_slug}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {item.product_title}
              </Link>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity} · KES {Number(item.subtotal).toLocaleString()}
              </p>
            </div>
            {canReview && item.product_id && (
              <ReviewButton
                productId={item.product_id}
                productTitle={item.product_title}
                productSlug={item.product_slug}
                alreadyReviewed={
                  itemReviewStatus.find((s) => s.item.id === item.id)?.reviewed ?? false
                }
              />
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
        <p className="text-lg font-semibold text-gray-900">
          Total: KES {Number(order.total).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
