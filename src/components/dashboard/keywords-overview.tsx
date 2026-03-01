"use client";

import Link from "next/link";

type KeywordItem = {
  id: string;
  title: string;
  slug: string;
  type: "product" | "page";
  meta_keywords: string[];
  editHref: string;
};

type KeywordsOverviewProps = {
  items: KeywordItem[];
  withKeywordsCount: number;
  keywordCounts: Record<string, number>;
};

export function KeywordsOverview({
  items,
  withKeywordsCount,
  keywordCounts,
}: KeywordsOverviewProps) {
  const sortedKeywords = Object.entries(keywordCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <dt className="text-sm font-medium text-gray-500">Total content</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {items.length}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <dt className="text-sm font-medium text-gray-500">
            With keywords set
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {withKeywordsCount}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <dt className="text-sm font-medium text-gray-500">Unique keywords</dt>
          <dd className="mt-1 text-2xl font-semibold text-gray-900">
            {sortedKeywords.length}
          </dd>
        </div>
      </div>

      {sortedKeywords.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Keyword usage
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortedKeywords.map(([keyword, count]) => (
              <span
                key={keyword}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {keyword}
                <span className="ml-1.5 rounded-full bg-blue-200 px-1.5 text-xs">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Content with keywords
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {items
            .filter((i) => i.meta_keywords.length > 0)
            .map((item) => (
              <li key={item.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-gray-900">
                      {item.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      /{item.slug} · {item.type}
                    </span>
                  </div>
                  <Link
                    href={item.editHref}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.meta_keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </li>
            ))}
        </ul>
        {withKeywordsCount === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No keywords set yet. Add meta keywords on product or page edit
            forms.
          </div>
        )}
      </div>
    </div>
  );
}
