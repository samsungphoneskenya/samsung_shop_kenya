"use client";

import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import ProductCard, { BadgePill } from "./ProductCard";

export default function NewArrivals({
  products,
}: {
  products: StorefrontProduct[];
}) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Just in!
          </h2>
          <p className="text-gray-600 text-lg">Browse our newest arrivals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeLeft={
                product.is_new_arrival ? (
                  <BadgePill variant="new">NEW ARRIVAL</BadgePill>
                ) : undefined
              }
              variant="default"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
