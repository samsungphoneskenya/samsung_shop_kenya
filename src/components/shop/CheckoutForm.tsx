"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/lib/actions/order-actions";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getCartTotal();
  const shippingFee = 0 as number;
  const subtotal = total;
  const grandTotal = subtotal + shippingFee;

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "mpesa">("cash_on_delivery");

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link href="/cart" className="text-blue-600 hover:underline font-medium">
          View cart
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneTrim = phone.trim().replace(/\s/g, "");
    if (phoneTrim.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setError("Please enter a delivery address (at least 5 characters).");
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => {
        const unitPrice = item.sale_price ?? item.price;
        return {
          product_id: item.product_id,
          product_title: item.title,
          product_slug: item.slug,
          product_image: item.image || undefined,
          product_sku: undefined,
          unit_price: unitPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
        };
      });

      const result = await createOrder({
        order_number: "",
        customer_name: name.trim() || "Customer",
        customer_phone: phoneTrim,
        customer_email: email.trim() || "",
        delivery_location: address.trim(),
        delivery_notes: notes.trim() || undefined,
        subtotal,
        tax: 0,
        shipping_fee: shippingFee,
        total: grandTotal,
        payment_method: paymentMethod,
        items: orderItems,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/checkout/success?order=${result.orderId}&number=${encodeURIComponent(result.orderNumber || "")}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Delivery details</h2>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX or 2547XX XXX XXX"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, area, town/city"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery notes <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gate code, landmark, etc."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Payment</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 has-[:checked]:border-black has-[:checked]:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="cash_on_delivery"
              checked={paymentMethod === "cash_on_delivery"}
              onChange={() => setPaymentMethod("cash_on_delivery")}
              className="h-4 w-4 text-black"
            />
            <span className="font-medium">Pay on delivery</span>
            <span className="text-gray-500 text-sm">(Cash or M-Pesa when order arrives)</span>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 has-[:checked]:border-black has-[:checked]:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="mpesa"
              checked={paymentMethod === "mpesa"}
              onChange={() => setPaymentMethod("mpesa")}
              className="h-4 w-4 text-black"
            />
            <span className="font-medium">M-Pesa (STK push)</span>
            <span className="text-gray-500 text-sm">Pay now via phone prompt</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Subtotal</span>
          <span>KSh {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Delivery</span>
          <span>{shippingFee === 0 ? "Free" : `KSh ${shippingFee && shippingFee.toLocaleString()}`}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 text-lg mt-4 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span>KSh {grandTotal.toLocaleString()}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 font-semibold disabled:opacity-50"
        >
          {loading ? "Placing order…" : "Place order"}
        </button>
      </div>
    </form>
  );
}
