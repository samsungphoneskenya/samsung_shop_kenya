import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import ProductCard from "@/components/shop/ProductCard";
import { NAV_TOP_LINKS, NAV_ACCESSORIES_LINKS } from "@/lib/constants/nav";
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

  const category =
    typeof params.category === "string" ? params.category : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const sort =
    typeof params.sort === "string" &&
    SORT_OPTIONS.some((o) => o.value === params.sort)
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
    minPrice:
      minPrice != null && !Number.isNaN(minPrice) ? minPrice : undefined,
    maxPrice:
      maxPrice != null && !Number.isNaN(maxPrice) ? maxPrice : undefined,
    limit: 48,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-2">
            Products
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {q
              ? `Results for “${q}”`
              : category
              ? [
                  ...NAV_TOP_LINKS,
                  ...NAV_ACCESSORIES_LINKS,
                  { slug: "galaxy-buds", label: "Audio" },
                ].find((c) => c.slug === category)?.label ?? "Shop"
              : "All Samsung products"}
          </h2>
          <p className="text-slate-600">
            {q
              ? `Results for “${q}”`
              : category
              ? `Category: ${
                  [
                    ...NAV_TOP_LINKS,
                    ...NAV_ACCESSORIES_LINKS,
                    { slug: "galaxy-buds", label: "Audio" },
                  ].find((c) => c.slug === category)?.label ?? category
                }`
              : "Discover our complete collection of Samsung products in Kenya."}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Sidebar – filters as URL params */}
          <aside className="w-full lg:w-64 shrink-0">
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
                        href={`/shop${buildShopQuery(params, {
                          category: item.slug,
                        })}`}
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
                        href={`/shop${buildShopQuery(params, {
                          category: item.slug,
                        })}`}
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
                      href={`/shop${buildShopQuery(params, {
                        category: "galaxy-buds",
                      })}`}
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
                      (minPrice === range.min ||
                        (range.min == null && minPrice == null)) &&
                      (maxPrice === range.max ||
                        (range.max == null && maxPrice == null));
                    const overrides: Partial<Record<string, string>> =
                      range.min == null && range.max == null
                        ? { min_price: "", max_price: "" }
                        : {
                            min_price:
                              range.min != null ? String(range.min) : "",
                            max_price:
                              range.max != null ? String(range.max) : "",
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
                <span className="font-semibold text-gray-900">
                  {products.length}
                </span>{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={`/shop${buildShopQuery(params, {
                        sort: opt.value,
                      })}`}
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
      {/* Hero + category rail inspired by Samsung offer page */}
      <section className="bg-linear-to-b from-[#050A1C] via-[#050A1C] to-[#020617] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="uppercase tracking-[0.25em] text-[0.65rem] sm:text-xs text-sky-300 mb-3">
              Samsung Shop Kenya
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Essentials for the way you live
            </h1>
            <p className="text-sm sm:text-base text-sky-100/80 max-w-xl">
              Discover Galaxy smartphones, tablets, wearables and more with
              official warranty and fast delivery across Kenya.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-100 transition-colors"
              >
                Shop all products
              </Link>
              <Link
                href={`/shop${buildShopQuery(params, { sort: "newest" })}`}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:border-white hover:bg-white/5 transition-colors"
              >
                View latest arrivals
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-[0.7rem] sm:text-xs text-sky-100/80">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                Official Samsung devices
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                Kenya-wide delivery
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                Manufacturer warranty
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-sky-500/20 via-sky-400/10 to-transparent p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-200 mb-4">
                Highlights
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <p className="font-semibold text-white">Galaxy S &amp; A</p>
                  <p className="text-sky-100/80">
                    Flagship power and everyday value with official Kenyan
                    warranty.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-white">Foldables</p>
                  <p className="text-sky-100/80">
                    Experience the future of mobile with Galaxy Z Fold &amp;
                    Flip.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-white">Tablets &amp; Tabs</p>
                  <p className="text-sky-100/80">
                    Do more with Galaxy Tab S and Tab A series.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-white">
                    Wearables &amp; Audio
                  </p>
                  <p className="text-sky-100/80">
                    Stay connected with Galaxy Watch, Buds and accessories.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-[0.7rem] sm:text-xs text-sky-100/80">
                  Curated by Samsung Shop Kenya – inspired by official Samsung
                  offers.
                </p>
                <span className="hidden sm:inline-flex items-center rounded-full bg-white px-3 py-1 text-[0.7rem] font-semibold text-slate-900">
                  Limited-time deals
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
