"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { createOrder } from "@/lib/actions/order-actions";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Smartphone,
} from "lucide-react";

const PLACEHOLDER = "/images/logo.png";

export default function CartCheckoutPage() {
  const router = useRouter();
  const {
    items,
    isValidating,
    updateQuantity,
    removeItem,
    getCartTotal,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "mpesa"
  >("cash_on_delivery");

  const subtotal = getCartTotal();
  const grandTotal = subtotal;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
            Checking your cart…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phoneTrim = phone.trim().replace(/\s/g, "");
    if (phoneTrim.length < 10) {
      setError("Enter a valid phone number (min 10 digits).");
      return;
    }
    if (address.trim().length < 5) {
      setError("Enter a delivery address (min 5 characters).");
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
        shipping_fee: 0,
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
      router.push(
        `/checkout/success?order=${result.orderId}&number=${encodeURIComponent(
          result.orderNumber || ""
        )}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Shared glass card style
  const glass =
    "bg-white/50 backdrop-blur-xl border border-white/75 rounded-2xl shadow-sm";
  const inputCls =
    "w-full bg-white/55 border border-black/10 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black/25 focus:bg-white/80 focus:ring-2 focus:ring-black/5 transition";
  const sectionLabel =
    "px-5 py-3 text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 border-b border-black/5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200 text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <h1 className="text-xl font-semibold tracking-tight mb-5">
          Cart &amp; Checkout
        </h1>

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div
            className={`${glass} flex flex-col items-center py-20 text-center`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center mb-4 text-gray-300">
              <ShoppingBag size={24} />
            </div>
            <p className="font-medium text-gray-800 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-400 mb-6">
              Add items from the shop to get started.
            </p>
            <Link
              href="/shop"
              className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-700 transition"
            >
              Browse shop
            </Link>
          </div>
        )}

        {/* ── Main layout ── */}
        {items.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-3.5 items-start">
              {/* ── Left column: items + delivery ── */}
              <div className="flex flex-col gap-3.5">
                {/* Items card */}
                <div className={glass}>
                  <p className={sectionLabel}>Items · {itemCount}</p>
                  <ul className="divide-y divide-black/[0.04] max-h-[360px] overflow-y-auto">
                    {items.map((item) => {
                      const unitPrice = item.sale_price ?? item.price;
                      const imgSrc = item.image || PLACEHOLDER;
                      return (
                        <li
                          key={item.product_id}
                          className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/30 transition"
                        >
                          {/* Image */}
                          <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-white/60 border border-white/80">
                            <Image
                              src={imgSrc}
                              alt={item.title}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                              unoptimized={imgSrc.includes("supabase")}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug hover:underline underline-offset-2"
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                              KSh {unitPrice.toLocaleString()}
                            </p>
                            {/* Qty controls */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <button
                                type="button"
                                aria-label="Decrease"
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity - 1
                                  )
                                }
                                className="w-6 h-6 rounded-md border border-black/10 bg-white/70 flex items-center justify-center hover:bg-white transition"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-5 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Increase"
                                onClick={() =>
                                  updateQuantity(
                                    item.product_id,
                                    item.quantity + 1
                                  )
                                }
                                className="w-6 h-6 rounded-md border border-black/10 bg-white/70 flex items-center justify-center hover:bg-white transition"
                              >
                                <Plus size={10} />
                              </button>
                              <button
                                type="button"
                                aria-label="Remove"
                                onClick={() => removeItem(item.product_id)}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition ml-1"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Line total */}
                          <span className="text-sm font-semibold font-mono flex-shrink-0">
                            KSh {(unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Delivery form card */}
                <div className={glass}>
                  <p className={sectionLabel}>Delivery details</p>
                  <div className="p-5 flex flex-col gap-3">
                    {error && (
                      <div className="text-sm text-red-700 bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-2.5">
                        {error}
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="phone"
                        className="text-xs font-medium text-gray-500"
                      >
                        Phone number <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        className={inputCls}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="address"
                        className="text-xs font-medium text-gray-500"
                      >
                        Delivery address <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="address"
                        required
                        rows={2}
                        className={inputCls}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, area, town / city"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="name"
                          className="text-xs font-medium text-gray-500"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          className={inputCls}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="email"
                          className="text-xs font-medium text-gray-500"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={inputCls}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="notes"
                        className="text-xs font-medium text-gray-500"
                      >
                        Delivery notes
                      </label>
                      <input
                        id="notes"
                        type="text"
                        className={inputCls}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Gate code, landmark, building…"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right sidebar ── */}
              <div className="flex flex-col gap-3.5 lg:sticky lg:top-6">
                {/* Payment options */}
                <div className={glass}>
                  <p className={sectionLabel}>Payment</p>
                  <div className="p-3.5 flex flex-col gap-2">
                    {(
                      [
                        {
                          value: "cash_on_delivery",
                          label: "Pay on delivery",
                          desc: "Cash or M-Pesa at the door",
                          Icon: Truck,
                        },
                        {
                          value: "mpesa",
                          label: "M-Pesa STK push",
                          desc: "Prompt sent to your phone",
                          Icon: Smartphone,
                        },
                      ] as const
                    ).map(({ value, label, desc, Icon }) => (
                      <label
                        key={value}
                        className={`flex items-start gap-3 p-3 rounded-xl border-[1.5px] cursor-pointer transition
                          ${
                            paymentMethod === value
                              ? "border-gray-900 bg-white/65"
                              : "border-black/8 bg-white/35 hover:bg-white/55 hover:border-black/15"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={value}
                          className="sr-only"
                          checked={paymentMethod === value}
                          onChange={() => setPaymentMethod(value)}
                        />
                        {/* Custom radio dot */}
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition
                          ${
                            paymentMethod === value
                              ? "border-gray-900"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === value && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                          )}
                        </span>
                        <span>
                          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                            <Icon size={13} className="text-gray-500" />
                            {label}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            {desc}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order summary + CTA */}
                <div className={glass}>
                  <div className="p-5 flex flex-col gap-2.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span className="font-mono text-gray-800">
                        KSh {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Delivery</span>
                      <span className="font-semibold text-emerald-600">
                        Free
                      </span>
                    </div>
                    <div className="border-t border-black/[0.06] pt-2.5 flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold font-mono text-lg text-gray-900">
                        KSh {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.99]"
                    >
                      {loading ? "Placing order…" : "Place order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
