import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { SEOAuditResults } from "@/components/dashboard/seo-audit-results";

export const metadata = {
  title: "SEO Audit",
  description: "Comprehensive SEO audit of your website",
};

export default async function SEOAuditPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  // Get all published content with SEO data
  const [productsResult, pagesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, title, slug, description, status, seo_metadata(*)")
      .eq("status", "published"),
    supabase
      .from("pages")
      .select("id, title, slug, content, status, seo_metadata(*)")
      .eq("status", "published"),
  ]);

  const products = productsResult.data || [];
  const pages = pagesResult.data || [];

  // Analyze each item
  // Replace the entire auditResults section with:

  const productAudits = products.map((item) => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    const seo = Array.isArray(item.seo_metadata)
      ? item.seo_metadata[0]
      : item.seo_metadata;

    // Check meta title
    if (!seo?.meta_title && !item.title) {
      issues.push("Missing meta title");
    } else {
      const title = seo?.meta_title || item.title;
      if (title.length < 30) {
        warnings.push("Meta title is too short (< 30 characters)");
      } else if (title.length > 60) {
        warnings.push("Meta title is too long (> 60 characters)");
      } else {
        successes.push("Meta title length is optimal");
      }
    }

    // Check meta description (products have 'description')
    const description = seo?.meta_description || item.description;
    if (!description) {
      issues.push("Missing meta description");
    } else if (description.length < 120) {
      warnings.push("Meta description is too short (< 120 characters)");
    } else if (description.length > 160) {
      warnings.push("Meta description is too long (> 160 characters)");
    } else {
      successes.push("Meta description length is optimal");
    }

    // Check focus keyword
    if (seo?.focus_keyword) {
      successes.push("Focus keyword defined");

      const title = (seo?.meta_title || item.title || "").toLowerCase();
      const keyword = seo.focus_keyword.toLowerCase();
      if (title.includes(keyword)) {
        successes.push("Focus keyword appears in title");
      } else {
        warnings.push("Focus keyword not found in title");
      }

      if (description && description.toLowerCase().includes(keyword)) {
        successes.push("Focus keyword appears in description");
      } else {
        warnings.push("Focus keyword not found in description");
      }
    } else {
      warnings.push("No focus keyword defined");
    }

    // Check slug
    if (item.slug.length > 50) {
      warnings.push("URL slug is very long");
    } else {
      successes.push("URL slug length is good");
    }

    // Check canonical URL
    if (!seo?.canonical_url) {
      warnings.push("No canonical URL set (using default)");
    }

    const score = Math.round(
      (successes.length /
        (issues.length + warnings.length + successes.length)) *
        100
    );

    return {
      id: item.id,
      type: "product" as const,
      title: item.title,
      slug: item.slug,
      score,
      issues,
      warnings,
      successes,
    };
  });

  const pageAudits = pages.map((item) => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    const seo = Array.isArray(item.seo_metadata)
      ? item.seo_metadata[0]
      : item.seo_metadata;

    // Check meta title
    if (!seo?.meta_title && !item.title) {
      issues.push("Missing meta title");
    } else {
      const title = seo?.meta_title || item.title;
      if (title.length < 30) {
        warnings.push("Meta title is too short (< 30 characters)");
      } else if (title.length > 60) {
        warnings.push("Meta title is too long (> 60 characters)");
      } else {
        successes.push("Meta title length is optimal");
      }
    }

    // Check meta description (pages have 'content')
    const description = seo?.meta_description || item.content;
    if (!description) {
      issues.push("Missing meta description");
    } else if (description.length < 120) {
      warnings.push("Meta description is too short (< 120 characters)");
    } else if (description.length > 160) {
      warnings.push("Meta description is too long (> 160 characters)");
    } else {
      successes.push("Meta description length is optimal");
    }

    // Check focus keyword
    if (seo?.focus_keyword) {
      successes.push("Focus keyword defined");

      const title = (seo?.meta_title || item.title || "").toLowerCase();
      const keyword = seo.focus_keyword.toLowerCase();
      if (title.includes(keyword)) {
        successes.push("Focus keyword appears in title");
      } else {
        warnings.push("Focus keyword not found in title");
      }

      if (description && description.toLowerCase().includes(keyword)) {
        successes.push("Focus keyword appears in description");
      } else {
        warnings.push("Focus keyword not found in description");
      }
    } else {
      warnings.push("No focus keyword defined");
    }

    // Check slug
    if (item.slug.length > 50) {
      warnings.push("URL slug is very long");
    } else {
      successes.push("URL slug length is good");
    }

    // Check canonical URL
    if (!seo?.canonical_url) {
      warnings.push("No canonical URL set (using default)");
    }

    const score = Math.round(
      (successes.length /
        (issues.length + warnings.length + successes.length)) *
        100
    );

    return {
      id: item.id,
      type: "page" as const,
      title: item.title,
      slug: item.slug,
      score,
      issues,
      warnings,
      successes,
    };
  });

  const auditResults = [...productAudits, ...pageAudits];

  // Sort by score (lowest first - needs most attention)
  auditResults.sort((a, b) => a.score - b.score);

  // Sort by score (lowest first - needs most attention)
  auditResults.sort((a, b) => a.score - b.score);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">SEO Audit</h1>
        <p className="mt-2 text-sm text-gray-700">
          Comprehensive analysis of all published pages on your site.
        </p>
      </div>

      <SEOAuditResults results={auditResults} />
    </div>
  );
}
