import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { SEOOverview } from "@/components/dashboard/seo-overview";

export const metadata = {
  title: "SEO Tools",
  description: "Advanced SEO tools and analytics",
};

export default async function SEODashboardPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  const [productsResult, pagesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, slug, status, meta_title, meta_description, meta_keywords"
      )
      .eq("status", "published"),
    supabase
      .from("pages")
      .select("id, title, slug, status, meta_title, meta_description")
      .eq("status", "published"),
  ]);

  const products = productsResult.data || [];
  const pages = pagesResult.data || [];
  const allEntities = [
    ...products.map((p) => ({
      meta_title: p.meta_title,
      meta_description: p.meta_description,
    })),
    ...pages.map((p) => ({
      meta_title: p.meta_title,
      meta_description: p.meta_description,
    })),
  ];

  const stats = {
    totalPages: products.length + pages.length,
    // Count entities that have at least a meta_title set
    withSEO: allEntities.filter((e) => e.meta_title && e.meta_title.length > 0)
      .length,
    missingMetaDescription: allEntities.filter(
      (e) => !e.meta_description || e.meta_description.length === 0
    ).length,
    missingMetaTitle: allEntities.filter(
      (e) => !e.meta_title || e.meta_title.length === 0
    ).length,
    // No score columns in current schema — default to 0
    avgReadabilityScore: 0,
    avgSeoScore: 0,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">SEO Tools</h1>
        <p className="mt-2 text-sm text-gray-700">
          Advanced SEO analysis and optimization tools for your website.
        </p>
      </div>

      <SEOOverview stats={stats} products={products} pages={pages} />

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/seo/audit"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">SEO Audit</h3>
              <p className="text-sm text-gray-500">
                Comprehensive site-wide SEO analysis
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/seo/meta-tags"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Meta Tags Manager
              </h3>
              <p className="text-sm text-gray-500">
                Bulk edit meta titles and descriptions
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/seo/keywords"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Keyword Analysis
              </h3>
              <p className="text-sm text-gray-500">
                Track and optimize focus keywords
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/seo/sitemap"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Sitemap Generator
              </h3>
              <p className="text-sm text-gray-500">
                Generate XML sitemap for search engines
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/seo/schema-generator"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Schema Markup
              </h3>
              <p className="text-sm text-gray-500">
                Add structured data to your pages
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/seo/readability"
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Readability Checker
              </h3>
              <p className="text-sm text-gray-500">
                Analyze content readability scores
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
