import { requireRole } from "@/lib/auth/session";
import Link from "next/link";

export const metadata = {
  title: "Readability Checker",
  description: "Content readability tips and analysis",
};

export default async function ReadabilityPage() {
  await requireRole(["admin", "editor", "seo_manager"]);

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
          Readability Checker
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Best practices for readable, accessible content that performs well in
          search.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-800">
            How we assess readability
          </h3>
          <p className="mt-2 text-sm text-blue-700">
            The{" "}
            <Link
              href="/dashboard/seo/audit"
              className="font-medium underline hover:no-underline"
            >
              SEO Audit
            </Link>{" "}
            reviews meta titles, descriptions, and structure. For full content
            readability (sentence length, headings, paragraph length), edit
            product descriptions and page content in the dashboard and aim for
            short sentences, clear headings, and scannable lists.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Readability best practices
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
            <li>
              <strong>Meta title:</strong> 30–60 characters; include the main
              keyword.
            </li>
            <li>
              <strong>Meta description:</strong> 120–160 characters; summarize
              the page and include a call to action.
            </li>
            <li>
              <strong>Headings:</strong> Use one H1 per page; use H2/H3 for
              sections so content is scannable.
            </li>
            <li>
              <strong>Paragraphs:</strong> Keep to 2–4 sentences; break up long
              blocks.
            </li>
            <li>
              <strong>Sentences:</strong> Aim for under 20 words where possible.
            </li>
            <li>
              <strong>Lists:</strong> Use bullet or numbered lists for steps and
              features.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard/seo/audit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            Run SEO Audit
          </Link>
          <Link
            href="/dashboard/seo/meta-tags"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Meta Tags Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
