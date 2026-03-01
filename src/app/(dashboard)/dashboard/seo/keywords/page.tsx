import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { KeywordsOverview } from "@/components/dashboard/keywords-overview";

export const metadata = {
  title: "Keyword Analysis",
  description: "Track and optimize focus keywords",
};

export default async function KeywordsPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  const [productsResult, pagesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, slug, meta_title, meta_description, meta_keywords")
      .eq("status", "published")
      .order("title"),
    supabase
      .from("pages")
      .select("id, title, slug, meta_title, meta_description")
      .eq("status", "published")
      .order("title"),
  ]);

  const products = (productsResult.data || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: "product" as const,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    meta_keywords: (p.meta_keywords || []) as string[],
    editHref: `/dashboard/products/${p.id}`,
  }));

  const pages = (pagesResult.data || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: "page" as const,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    meta_keywords: [] as string[],
    editHref: `/dashboard/pages/${p.slug}`,
  }));

  const items = [...products, ...pages];
  const withKeywords = items.filter((i) => i.meta_keywords.length > 0);
  const allKeywords = items.flatMap((i) => i.meta_keywords);
  const keywordCounts = allKeywords.reduce((acc, k) => {
    const key = k.toLowerCase().trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/seo"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← SEO Tools
          </Link>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Keyword Analysis
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of focus keywords from products. Add meta keywords on product
          edit to track them here.
        </p>
      </div>

      <KeywordsOverview
        items={items}
        withKeywordsCount={withKeywords.length}
        keywordCounts={keywordCounts}
      />
    </div>
  );
}
