import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { MetaTagsTable } from "@/components/dashboard/meta-tags-table";

export const metadata = {
  title: "Meta Tags Manager",
  description: "Bulk view and edit meta titles and descriptions",
};

export default async function MetaTagsPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  const [productsResult, pagesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, slug, status, meta_title, meta_description")
      .eq("status", "published")
      .order("title"),
    supabase
      .from("pages")
      .select("id, title, slug, status, meta_title, meta_description")
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
    editHref: `/dashboard/products/${p.id}`,
  }));

  const pages = (pagesResult.data || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: "page" as const,
    meta_title: p.meta_title,
    meta_description: p.meta_description,
    editHref: `/dashboard/pages/${p.slug}`,
  }));

  const items = [...products, ...pages];

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
          Meta Tags Manager
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          View and edit meta titles and descriptions. Click &quot;Edit&quot; to
          update on the product or page form.
        </p>
      </div>

      <MetaTagsTable items={items} />
    </div>
  );
}
