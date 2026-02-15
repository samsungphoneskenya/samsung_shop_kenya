"use client"

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createOrderFromDashboard } from "@/lib/actions/order-actions";

type FormState =
  | {
      error?: string;
      success?: boolean;
      orderId?: string;
      orderNumber?: string;
    }
  | undefined;

export function OrderCreateForm() {
  const router = useRouter();

  const createAction = async (
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const customer_name = formData.get("customer_name")?.toString() ?? "";
    const customer_phone = formData.get("customer_phone")?.toString() ?? "";
    const customer_email = formData.get("customer_email")?.toString() ?? "";
    const delivery_location =
      formData.get("delivery_location")?.toString() ?? "";
    const delivery_notes =
      formData.get("delivery_notes")?.toString() || undefined;
    const payment_method =
      formData.get("payment_method")?.toString() ?? "cash_on_delivery";

    const subtotal = Number(formData.get("subtotal") || 0);
    const tax_amount = Number(formData.get("tax_amount") || 0);
    const shipping_fee = Number(formData.get("shipping_fee") || 0);

    if (!customer_name.trim() || !customer_phone.trim()) {
      return { error: "Customer name and phone are required" };
    }

    if (!delivery_location.trim()) {
      return { error: "Delivery location is required" };
    }

    if (!subtotal || subtotal <= 0) {
      return { error: "Subtotal must be greater than 0" };
    }

    const result = await createOrderFromDashboard({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email.trim() || undefined,
      delivery_location: delivery_location.trim(),
      delivery_notes: delivery_notes || null,
      payment_method,
      subtotal,
      tax_amount,
      shipping_fee,
    });

    if (result.success && result.orderId) {
      router.push(`/dashboard/orders/${result.orderId}`);
      return result;
    }

    return result;
  };

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createAction,
    undefined
  );

  const totalPreview =
    Number(
      (typeof window !== "undefined"
        ? (document.getElementById("subtotal") as HTMLInputElement | null)
            ?.value
        : "") || 0
    ) +
    Number(
      (typeof window !== "undefined"
        ? (document.getElementById("tax_amount") as HTMLInputElement | null)
            ?.value
        : "") || 0
    ) +
    Number(
      (typeof window !== "undefined"
        ? (document.getElementById("shipping_fee") as HTMLInputElement | null)
            ?.value
        : "") || 0
    );

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-black"
    >
      <h1 className="text-xl font-semibold text-gray-900">
        Create manual order
      </h1>
      <p className="text-sm text-gray-500">
        Create an order from the dashboard for walk-in customers or phone
        orders.
      </p>

      {state?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {/* Customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="customer_name"
            className="block text-sm font-medium text-gray-700"
          >
            Customer name
          </label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="customer_phone"
            className="block text-sm font-medium text-gray-700"
          >
            Customer phone
          </label>
          <input
            id="customer_phone"
            name="customer_phone"
            type="tel"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="07XX XXX XXX"
            required
          />
        </div>
        <div>
          <label
            htmlFor="customer_email"
            className="block text-sm font-medium text-gray-700"
          >
            Customer email
          </label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Delivery */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="delivery_location"
            className="block text-sm font-medium text-gray-700"
          >
            Delivery location
          </label>
          <textarea
            id="delivery_location"
            name="delivery_location"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
            required
          />
        </div>
        <div>
          <label
            htmlFor="delivery_notes"
            className="block text-sm font-medium text-gray-700"
          >
            Delivery notes
          </label>
          <input
            id="delivery_notes"
            name="delivery_notes"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Landmark, gate code, etc."
          />
        </div>
      </div>

      {/* Payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="payment_method"
            className="block text-sm font-medium text-gray-700"
          >
            Payment method
          </label>
          <select
            id="payment_method"
            name="payment_method"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            defaultValue="cash_on_delivery"
          >
            <option value="cash_on_delivery">Cash on delivery</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>

      {/* Amounts */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="subtotal"
            className="block text-sm font-medium text-gray-700"
          >
            Subtotal (KSh)
          </label>
          <input
            id="subtotal"
            name="subtotal"
            type="number"
            min={0}
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="tax_amount"
            className="block text-sm font-medium text-gray-700"
          >
            Tax (KSh)
          </label>
          <input
            id="tax_amount"
            name="tax_amount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="shipping_fee"
            className="block text-sm font-medium text-gray-700"
          >
            Shipping (KSh)
          </label>
          <input
            id="shipping_fee"
            name="shipping_fee"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-500">
          Total will be calculated as subtotal + tax + shipping.
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating order…" : "Create order"}
        </button>
      </div>
    </form>
  );
}

