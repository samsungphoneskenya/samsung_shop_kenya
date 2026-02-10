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
    product.featured_image ||
    product.gallery_images?.[0] ||
    PLACEHOLDER_IMAGE
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
  const description =
    product.short_description || product.description || "";
  const rating = product.avg_rating ?? 0;
  const reviewCount = product.review_count ?? 0;
  const showComparePrice =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  const isCompact = variant === "compact";
  const imageHeight = isCompact ? "h-56 sm:h-60" : "h-64 sm:h-72";
  const padding = isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6";
  const titleSize = isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl";

  return (
    <article
      className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100/80"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`View ${product.title}`}
      >
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
          <div
            className={`bg-gradient-to-br from-gray-50 to-gray-100 ${imageHeight} flex items-center justify-center relative overflow-hidden p-4`}
          >
            <SafeImage
              src={imageUrl}
              alt={product.title}
              width={600}
              height={600}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
        <div className={padding}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Star
              className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0"
              aria-hidden
            />
            <span
              className="text-sm font-semibold text-gray-900"
              aria-label={`Rating: ${rating} out of 5`}
            >
              {rating.toFixed(1)}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
          <h3
            className={`font-bold text-gray-900 mb-2 line-clamp-2 ${titleSize}`}
            itemProp="name"
          >
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="text-lg sm:text-xl font-bold text-gray-900"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="price" content={String(product.price)} />
              <meta itemProp="priceCurrency" content="KES" />
              {formatPrice(product.price)}
            </span>
            {showComparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_at_price!)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className={`${padding} pt-0`}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: product.id,
              product_id: product.id,
              title: product.title,
              slug: product.slug,
              price: product.compare_at_price && product.compare_at_price > product.price ? product.compare_at_price : product.price,
              sale_price: product.compare_at_price && product.compare_at_price > product.price ? product.price : undefined,
              image: imageUrl,
            });
          }}
          className="w-full bg-black text-white py-2.5 sm:py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg"
          aria-label={`Add ${product.title} to cart`}
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
}
