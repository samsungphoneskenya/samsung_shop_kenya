import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/db/client";

export const metadata = {
  title: "Sitemap Generator",
  description: "Generate XML sitemap for search engines",
};

export default async function SitemapPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  // Count URLs
  const [productsCount, pagesCount, categoriesCount] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  const totalUrls =
    1 + // homepage
    (productsCount.count || 0) +
    (pagesCount.count || 0) +
    (categoriesCount.count || 0);

  const sitemapUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sitemap Generator
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Automatically generate XML sitemap for search engines.
        </p>
      </div>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Your sitemap is automatically generated
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  The sitemap includes all published products, pages, and
                  categories. It&apos;s automatically updated when you publish
                  new content.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sitemap Statistics
            </h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total URLs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalUrls}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Products
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {productsCount.count || 0}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pages
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {pagesCount.count || 0}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Categories
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {categoriesCount.count || 0}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sitemap URL */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sitemap URL
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={sitemapUrl}
                className="flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <a
                href={sitemapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View Sitemap
              </a>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Submit to Search Engines
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Google Search Console
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    Go to{" "}
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Google Search Console
                    </a>
                  </li>
                  <li>Select your property</li>
                  <li>Click &quot;Sitemaps&quot; in the left sidebar</li>
                  <li>
                    Enter:{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      sitemap.xml
                    </code>
                  </li>
                  <li>Click &quot;Submit&quot;</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Bing Webmaster Tools
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    Go to{" "}
                    <a
                      href="https://www.bing.com/webmasters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Bing Webmaster Tools
                    </a>
                  </li>
                  <li>Select your site</li>
                  <li>
                    Click &quot;Sitemaps&quot; under &quot;Configure My
                    Site&quot;
                  </li>
                  <li>Enter your sitemap URL</li>
                  <li>Click &quot;Submit&quot;</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  robots.txt
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Add this line to your robots.txt file:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  Sitemap: {sitemapUrl}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
