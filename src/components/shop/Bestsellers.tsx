"use client";

import { TrendingUp } from "lucide-react";
import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import ProductCard, { BadgePillRight } from "./ProductCard";

export default function Bestsellers({
  products,
}: {
  products: StorefrontProduct[];
}) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Try our bestsellers
          </h2>
          <p className="text-gray-600 text-lg m-auto max-w-3xl flex text-center">
            At our shop, we believe in the power of technology to enhance your
            life. That&apos;s why we offer the latest Samsung smartphones and
            accessories for work, gaming, entertainment, and everyday use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeRight={
                <BadgePillRight>
                  <TrendingUp className="h-3 w-3 text-orange-500 shrink-0" />
                  <span>
                    {product.stock_status === "out_of_stock"
                      ? "Out of stock"
                      : `${product.review_count ?? 0} reviews`}
                  </span>
                </BadgePillRight>
              }
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
