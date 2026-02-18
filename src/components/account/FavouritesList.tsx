"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useFavourites } from "@/contexts/FavouritesContext";
import { getProductsByIds } from "@/lib/actions/storefront-actions";
import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import { SafeImage } from "@/components/shared/SafeImage";

export function FavouritesList() {
  const { favouriteIds, removeFavourite } = useFavourites();
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favouriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getProductsByIds(favouriteIds)
      .then((list) => setProducts(list))
      .finally(() => setLoading(false));
  }, [favouriteIds]);

  if (loading) {
    return <p className="text-gray-500">Loading favourites…</p>;
  }

  if (favouriteIds.length === 0) {
    return (
      <div>
        <p className="text-gray-500">Your favourites list is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-blue-600 hover:underline font-medium">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex flex-wrap items-center gap-4 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
        >
          <Link href={`/product/${product.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <SafeImage
                src={product.featured_image || "/images/logo.png"}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.title}</p>
              <p className="text-sm text-blue-600 font-semibold">
                KES {(product.compare_at_price && product.compare_at_price > product.price ? product.price : product.price).toLocaleString()}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => removeFavourite(product.id)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            aria-label="Remove from favourites"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
