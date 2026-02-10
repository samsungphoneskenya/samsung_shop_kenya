"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

const PLACEHOLDER = "/images/logo.png";

export function CartContent() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center">
        <p className="text-gray-600 mb-6">Your cart is empty.</p>
        <Link
          href="/shop"
          className="inline-block bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 font-semibold"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => {
            const unitPrice = item.sale_price ?? item.price;
            const lineTotal = unitPrice * item.quantity;
            const imgSrc = item.image || PLACEHOLDER;
            return (
              <li key={item.product_id} className="flex gap-4 p-4 sm:p-6">
                <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={imgSrc}
                    alt={item.title}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized={imgSrc.includes("supabase")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium text-gray-900 hover:underline line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    KSh {unitPrice.toLocaleString()} × {item.quantity}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="ml-2 p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    KSh {lineTotal.toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
          <span>Total</span>
          <span>KSh {total.toLocaleString()}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block w-full text-center bg-black text-white py-3 rounded-xl hover:bg-gray-800 font-semibold"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
