"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import type { StorefrontProduct } from "@/lib/actions/storefront-actions";
import { useCart } from "@/contexts/CartContext";

type Props = {
  product: StorefrontProduct;
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    const price =
      product.compare_at_price && product.compare_at_price > product.price
        ? product.compare_at_price
        : product.price;

    const salePrice =
      product.compare_at_price && product.compare_at_price > product.price
        ? product.price
        : undefined;

    const image =
      product.featured_image || product.gallery_images?.[0] || undefined;

    addItem({
      id: product.id,
      product_id: product.id,
      title: product.title,
      slug: product.slug,
      price,
      sale_price: salePrice,
      image,
    });

    router.push("/cart");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
    >
      <ShoppingCart className="h-4 w-4" />
      Add to cart &amp; checkout
    </button>
  );
}
