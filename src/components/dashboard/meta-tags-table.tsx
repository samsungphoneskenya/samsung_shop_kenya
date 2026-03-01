"use client";

import Link from "next/link";
import { useState } from "react";

type MetaTagsItem = {
  id: string;
  title: string;
  slug: string;
  type: "product" | "page";
  meta_title: string | null;
  meta_description: string | null;
  editHref: string;
};

type MetaTagsTableProps = {
  items: MetaTagsItem[];
};

export function MetaTagsTable({ items }: MetaTagsTableProps) {
  const [filter, setFilter] = useState<"all" | "complete" | "missing">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "page">(
    "all"
  );
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.type === typeFilter;
    const hasMeta = !!(item.meta_title && item.meta_description);
    const matchMeta =
      filter === "all" ||
      (filter === "complete" && hasMeta) ||
      (filter === "missing" && !hasMeta);
    return matchSearch && matchType && matchMeta;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | "product" | "page")
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All types</option>
          <option value="product">Products</option>
          <option value="page">Pages</option>
        </select>
        <div className="flex gap-2">
          {(["all", "complete", "missing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              }`}
            >
              {f === "all" && `All (${items.length})`}
              {f === "complete" &&
                `Complete (${
                  items.filter((i) => i.meta_title && i.meta_description).length
                })`}
              {f === "missing" &&
                `Missing (${
                  items.filter((i) => !i.meta_title || !i.meta_description)
                    .length
                })`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title / Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Meta Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Meta Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No items match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">/{item.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        {item.type}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <span
                        className={`block truncate text-sm ${
                          item.meta_title ? "text-gray-900" : "text-amber-600"
                        }`}
                        title={item.meta_title || undefined}
                      >
                        {item.meta_title || "—"}
                      </span>
                      {item.meta_title && (
                        <span className="text-xs text-gray-400">
                          {item.meta_title.length}/60
                        </span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      <span
                        className={`block truncate text-sm ${
                          item.meta_description
                            ? "text-gray-900"
                            : "text-amber-600"
                        }`}
                        title={item.meta_description || undefined}
                      >
                        {item.meta_description || "—"}
                      </span>
                      {item.meta_description && (
                        <span className="text-xs text-gray-400">
                          {item.meta_description.length}/160
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={item.editHref}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
