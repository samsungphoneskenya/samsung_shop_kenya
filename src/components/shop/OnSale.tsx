"use client";

import { Tag } from "lucide-react";
import Link from "next/link";
import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import ProductCard, { BadgePill } from "./ProductCard";

export default function OnSale({
  products,
}: {
  products: StorefrontProduct[];
}) {
  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold mb-4">
            <Tag className="h-5 w-5 shrink-0" />
            <span>LIMITED TIME OFFERS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            On Sale Now!
          </h2>
          <p className="text-gray-600 text-lg">
            Grab these amazing deals before they&apos;re gone
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeLeft={
                product.discount_percentage != null &&
                product.discount_percentage > 0 ? (
                  <BadgePill variant="sale">
                    {Math.round(product.discount_percentage)}% OFF
                  </BadgePill>
                ) : undefined
              }
              variant="compact"
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg shadow-lg"
          >
            <span>View All Deals</span>
            <Tag className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
