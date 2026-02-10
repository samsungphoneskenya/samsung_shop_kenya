import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";

import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import ProductCard from "@/components/shop/ProductCard";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/actions/storefront-actions";


function buildSeoDescription(input: {
  meta_description: string | null;
  short_description: string | null;
  description: string | null;
}): string {
  const source =
    input.meta_description ||
    input.short_description ||
    input.description ||
    "";

  const trimmed = source.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 160) return trimmed;

  return `${trimmed.slice(0, 157).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | Samsung Shop Kenya",
      description: "The requested product could not be found.",
    };
  }

  const title =
    product.meta_title ||
    `${product.title} | ${product.category_name ?? "Samsung Shop Kenya"}`;

  const description = buildSeoDescription({
    meta_description: product.meta_description,
    short_description: product.short_description,
    description: product.description,
  });

  const image = product.featured_image || product.gallery_images?.[0] || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related =
    product.category_id != null
      ? await getRelatedProducts(product.id, product.category_id, 4)
      : [];

  const image = product.featured_image || product.gallery_images?.[0] || null;

  const price = product.price;
  const compare = product.compare_at_price ?? undefined;

  const isOnSale = !!compare && compare > price;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 text-sm text-gray-600 mb-6 sm:mb-8"
        >
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-900 transition-colors">
            Shop
          </Link>
          {product.category_slug && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category_slug}`}
                className="hover:text-gray-900 transition-colors"
              >
                {product.category_name ?? product.category_slug}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.title}</span>
        </nav>

        {/* Product layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Media */}
          <div>
            <div className="relative bg-white rounded-3xl shadow-md overflow-hidden p-6 sm:p-8 mb-4">
              {product.on_sale && isOnSale && (
                <div className="absolute left-6 top-6 inline-flex items-center rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Sale
                  {product.discount_percentage != null &&
                    product.discount_percentage > 0 && (
                      <span className="ml-1">
                        -{product.discount_percentage}%
                      </span>
                    )}
                </div>
              )}

              {product.is_new_arrival && (
                <div className="absolute right-6 top-6 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  New arrival
                </div>
              )}

              {image && (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={image}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 36rem, 100vw"
                    priority
                    className="object-contain"
                  />
                </div>
              )}

              {!image && (
                <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 text-sm">
                  No image available
                </div>
              )}
            </div>

            {product.gallery_images && product.gallery_images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.gallery_images.slice(0, 4).map((src, idx) => (
                  <div
                    key={src + idx}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <Image
                      src={src}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col">
            {/* Heading */}
            <header className="mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3">
                {product.title}
              </h1>
              {product.short_description && (
                <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                  {product.short_description}
                </p>
              )}
            </header>

            {/* Rating + stock */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-100">
                  <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                  {product.avg_rating?.toFixed(1) ?? "4.8"}
                </span>
                <span className="text-xs text-gray-500">
                  {product.review_count ?? 0} reviews
                </span>
              </div>

              <div className="h-4 w-px bg-gray-200" />

              <div className="flex items-center gap-2 text-xs font-medium">
                {product.stock_status === "out_of_stock" ? (
                  <span className="text-rose-600">Out of stock</span>
                ) : product.stock_status === "low_stock" ? (
                  <span className="text-amber-600">Low stock – order soon</span>
                ) : (
                  <span className="text-emerald-600">In stock</span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 rounded-2xl bg-gray-900 text-white p-5 shadow-md flex flex-wrap items-baseline gap-3">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                  KES {price.toLocaleString()}
                </p>
                {isOnSale && compare && (
                  <p className="text-sm text-gray-300 line-through">
                    KES {compare.toLocaleString()}
                  </p>
                )}
              </div>

              {product.discount_percentage != null &&
                product.discount_percentage > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/40">
                    Save {product.discount_percentage}%
                  </span>
                )}
            </div>

            {/* Actions – kept simple to avoid client cart dependencies */}
            <div className="mb-8 flex flex-col gap-3">
              <Link
                href={`https://wa.me/254758313512?text=${encodeURIComponent(
                  `Hi, I'm interested in ${product.title} (${
                    product.category_name ?? "Samsung"
                  }) at KES ${price.toLocaleString()}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Order instantly on WhatsApp
              </Link>

              <p className="text-xs text-gray-500">
                Prefer talking to a person? Tap the button above to chat with
                our team on WhatsApp and confirm delivery within Nairobi.
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  Product overview
                </h2>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                  {product.description}
                </p>
              </section>
            )}

            {/* Assurance badges */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-auto">
              <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3">
                <Truck className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Same‑day delivery
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Within Nairobi on orders confirmed before 3pm.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
                <Shield className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    1 year warranty
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Official Samsung Kenya warranty on all devices.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-purple-50 px-4 py-3">
                <RefreshCw className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Hassle‑free returns
                  </p>
                  <p className="text-[11px] text-gray-600">
                    48‑hour return window for eligible orders.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="related-heading"
                className="text-lg sm:text-xl font-semibold text-gray-900"
              >
                You may also like
              </h2>
              <Link
                href="/shop"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}