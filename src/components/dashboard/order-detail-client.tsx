"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database.types";
import {
  confirmOrderPayment,
  sendOrderWhatsApp,
  updateOrderStatus,
} from "@/lib/actions/order-actions";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

type OrderDetailClientProps = {
  order: Order;
  items: OrderItem[];
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export function OrderDetailClient({ order, items }: OrderDetailClientProps) {
  const router = useRouter();
  const [paymentRef, setPaymentRef] = useState(order.payment_reference || "");
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleConfirmPayment = async () => {
    setConfirmingPayment(true);
    setMessage(null);
    try {
      const result = await confirmOrderPayment(order.id, paymentRef.trim() || null);
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setMessage({ type: "success", text: "Payment marked as paid." });
        router.refresh();
      }
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true);
    setMessage(null);
    try {
      const result = await sendOrderWhatsApp(order.id);
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setMessage({ type: "success", text: "WhatsApp sent (timestamp recorded). Integrate API for real send." });
        router.refresh();
      }
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    setMessage(null);
    try {
      const result = await updateOrderStatus(order.id, { status: newStatus as (typeof STATUS_OPTIONS)[number] });
      if (result.error) setMessage({ type: "error", text: result.error });
      else {
        setMessage({ type: "success", text: "Status updated." });
        router.refresh();
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Customer & delivery */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Customer & delivery</h2>
          </div>
          <div className="px-6 py-4 space-y-3 text-sm">
            <p>
              <span className="text-gray-500">Name:</span> {order.customer_name}
            </p>
            <p>
              <span className="text-gray-500">Phone:</span>{" "}
              <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">
                {order.customer_phone}
              </a>
            </p>
            {order.customer_email && (
              <p>
                <span className="text-gray-500">Email:</span> {order.customer_email}
              </p>
            )}
            <p>
              <span className="text-gray-500">Address:</span> {order.delivery_location}
            </p>
            {order.delivery_notes && (
              <p>
                <span className="text-gray-500">Notes:</span> {order.delivery_notes}
              </p>
            )}
          </div>
        </div>

        {/* Payment & actions */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Payment & actions</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm">
              <span className="text-gray-500">Method:</span>{" "}
              {order.payment_method === "mpesa" ? "M-Pesa" : "Cash on delivery"}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Status:</span>{" "}
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  order.payment_status === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.payment_status || "pending"}
              </span>
            </p>

            {order.payment_method === "mpesa" && order.payment_status !== "paid" && (
              <div className="flex flex-wrap items-end gap-2 pt-2">
                <div className="flex-1 min-w-[160px]">
                  <label htmlFor="payment-ref" className="block text-xs font-medium text-gray-500 mb-1">
                    M-Pesa reference (optional)
                  </label>
                  <input
                    id="payment-ref"
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. QGH12345"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={confirmingPayment}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {confirmingPayment ? "Saving…" : "Confirm payment"}
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-500 mb-1">Order status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsApp}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {sendingWhatsApp ? "Sending…" : "Send WhatsApp notification"}
              </button>
              {order.whatsapp_sent_at && (
                <p className="mt-2 text-xs text-gray-500">
                  Last sent: {new Date(order.whatsapp_sent_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.product_title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    KSh {Number(item.unit_price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    KSh {Number(item.subtotal).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-6 text-sm">
          <span>Subtotal: KSh {Number(order.subtotal).toLocaleString()}</span>
          {Number(order.shipping_fee || 0) > 0 && (
            <span>Shipping: KSh {Number(order.shipping_fee).toLocaleString()}</span>
          )}
          <span className="font-semibold">Total: KSh {Number(order.total).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
