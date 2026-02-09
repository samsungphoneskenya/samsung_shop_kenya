import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import ProductCard from "@/components/shop/ProductCard";
import {
  NAV_TOP_LINKS,
  NAV_ACCESSORIES_LINKS,
} from "@/lib/constants/nav";
import { getProducts } from "@/lib/actions/storefront-actions";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
] as const;

const PRICE_RANGES = [
  { min: undefined, max: undefined, label: "All prices" },
  { min: 0, max: 50_000, label: "Under KES 50,000" },
  { min: 50_000, max: 100_000, label: "KES 50,000 – 100,000" },
  { min: 100_000, max: 150_000, label: "KES 100,000 – 150,000" },
  { min: 150_000, max: undefined, label: "Over KES 150,000" },
];

type SearchParams = { [key: string]: string | string[] | undefined };

function buildShopQuery(
  params: SearchParams,
  overrides: Partial<Record<string, string>> = {}
): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v == null || Array.isArray(v)) continue;
    merged[k] = String(v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === "") delete merged[k];
    else merged[k] = v;
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== "all") q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await Promise.resolve(searchParams);

  const category = typeof params.category === "string" ? params.category : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const sort =
    typeof params.sort === "string" && SORT_OPTIONS.some((o) => o.value === params.sort)
      ? params.sort
      : "newest";
  const minPrice =
    typeof params.min_price === "string" && params.min_price !== ""
      ? Number(params.min_price)
      : undefined;
  const maxPrice =
    typeof params.max_price === "string" && params.max_price !== ""
      ? Number(params.max_price)
      : undefined;

  const products = await getProducts({
    categorySlug: category,
    search: q,
    sort: sort as "newest" | "price-asc" | "price-desc" | "name",
    minPrice: minPrice != null && !Number.isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
    limit: 48,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Shop
          </h1>
          <p className="text-gray-600">
            {q
              ? `Results for “${q}”`
              : category
                ? `Category: ${[
                    ...NAV_TOP_LINKS,
                    ...NAV_ACCESSORIES_LINKS,
                    { slug: "galaxy-buds", label: "Audio" },
                  ].find((c) => c.slug === category)?.label ?? category}`
                : "Discover our complete collection of Samsung products"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar – filters as URL params */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/shop"
                      className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                        !category
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All products
                    </Link>
                  </li>
                  {NAV_TOP_LINKS.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/shop${buildShopQuery(params, { category: item.slug })}`}
                        className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                          category === item.slug
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  {NAV_ACCESSORIES_LINKS.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/shop${buildShopQuery(params, { category: item.slug })}`}
                        className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                          category === item.slug
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/shop${buildShopQuery(params, { category: "galaxy-buds" })}`}
                      className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                        category === "galaxy-buds"
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Audio
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
                <ul className="space-y-1">
                  {PRICE_RANGES.map((range) => {
                    const isActive =
                      (minPrice === range.min || (range.min == null && minPrice == null)) &&
                      (maxPrice === range.max || (range.max == null && maxPrice == null));
                    const overrides: Partial<Record<string, string>> =
                      range.min == null && range.max == null
                        ? { min_price: "", max_price: "" }
                        : {
                            min_price: range.min != null ? String(range.min) : "",
                            max_price: range.max != null ? String(range.max) : "",
                          };
                    return (
                      <li key={range.label}>
                        <Link
                          href={`/shop${buildShopQuery(params, overrides)}`}
                          className={`block py-2 px-3 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-gray-100 font-medium text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {range.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Link
                href="/shop"
                className="block w-full py-2.5 text-center border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset filters
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-900">{products.length}</span>{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={`/shop${buildShopQuery(params, { sort: opt.value })}`}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sort === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Try changing the category, search term, or price range
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                >
                  View all products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
