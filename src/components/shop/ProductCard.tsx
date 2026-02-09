"use client";

import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/shared/SafeImage";
import type { ReactNode } from "react";
import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import { useCart } from "@/contexts/CartContext";

const PLACEHOLDER_IMAGE = "/images/logo.png";

function productImageUrl(product: StorefrontProduct): string {
  return (
    product.featured_image || product.gallery_images?.[0] || PLACEHOLDER_IMAGE
  );
}

function formatPrice(value: number): string {
  return `KES ${value.toLocaleString()}`;
}

/** Reusable pill badges for product cards. Use with ProductCard badgeLeft/badgeRight. */
export function BadgePill({
  children,
  variant = "new",
}: {
  children: ReactNode;
  variant?: "new" | "sale";
}) {
  const classes =
    variant === "sale"
      ? "bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold shadow-lg"
      : "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold shadow-lg";
  return <span className={classes}>{children}</span>;
}

/** Small pill for right-side badge (e.g. reviews, stock). */
export function BadgePillRight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-gray-900 shadow-sm">
      {children}
    </span>
  );
}

type ProductCardProps = {
  product: StorefrontProduct;
  /** Optional left badge (e.g. "NEW ARRIVAL", "20% OFF") */
  badgeLeft?: ReactNode;
  /** Optional right badge (e.g. review count, "Out of stock") */
  badgeRight?: ReactNode;
  /** default: larger image + padding; compact: smaller image, tighter padding */
  variant?: "default" | "compact";
};

export default function ProductCard({
  product,
  badgeLeft,
  badgeRight,
  variant = "default",
}: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = productImageUrl(product);
  const description = product.short_description || product.description || "";
  const rating = product.avg_rating ?? 0;
  const reviewCount = product.review_count ?? 0;
  const showComparePrice =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  const isCompact = variant === "compact";
  const imageHeight = isCompact ? "h-48" : "h-56";
  const padding = isCompact ? "p-3" : "p-4";

  return (
    <article
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100 flex flex-col h-full"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block flex-shrink-0"
        aria-label={`View ${product.title}`}
      >
        {/* Image Container - Fixed height with consistent background */}
        <div className="relative">
          {badgeLeft && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              {badgeLeft}
            </div>
          )}
          {badgeRight && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
              {badgeRight}
            </div>
          )}

          {/* Fixed aspect ratio container with subtle pattern background */}
          <div
            className={`relative ${imageHeight} overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50`}
          >
            {/* Subtle dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Image wrapper with padding and centering */}
            <div className="absolute inset-0 p-4 flex items-center justify-center">
              <div className="relative w-full h-full">
                <SafeImage
                  src={imageUrl}
                  alt={product.title}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Container - Flexible with consistent structure */}
        <div className={`${padding} flex-grow flex flex-col`}>
          {/* Rating Section - Fixed height */}
          <div className="flex items-center gap-1.5 mb-2 h-4">
            <div className="flex items-center gap-1">
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0"
                aria-hidden
              />
              <span
                className="text-xs font-semibold text-gray-900"
                aria-label={`Rating: ${rating} out of 5`}
              >
                {rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>

          {/* Title - Fixed 2 lines with ellipsis */}
          <h3
            className="font-bold text-gray-900 mb-1.5 text-base leading-snug h-11 line-clamp-2"
            itemProp="name"
          >
            {product.title}
          </h3>

          {/* Description - Fixed 2 lines with ellipsis */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10 leading-5">
            {description}
          </p>

          {/* Price Section - Fixed height at bottom of content */}
          <div className="mt-auto">
            <div className="flex flex-wrap items-baseline gap-2 mb-3">
              <span
                className="text-lg font-bold text-gray-900"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <meta itemProp="price" content={String(product.price)} />
                <meta itemProp="priceCurrency" content="KES" />
                {formatPrice(product.price)}
              </span>
              {showComparePrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Fixed at bottom */}
      <div className={`${padding} pt-0 mt-auto`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: product.id,
              product_id: product.id,
              title: product.title,
              slug: product.slug,
              price:
                product.compare_at_price &&
                product.compare_at_price > product.price
                  ? product.compare_at_price
                  : product.price,
              sale_price:
                product.compare_at_price &&
                product.compare_at_price > product.price
                  ? product.price
                  : undefined,
              image: imageUrl,
            });
          }}
          className="w-full bg-gray-900 text-white py-2.5 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          aria-label={`Add ${product.title} to cart`}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}
