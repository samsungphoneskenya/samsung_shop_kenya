"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Blog } from "@/lib/actions/blog-actions";
import { useState } from "react";
import { deleteBlog } from "@/lib/actions/blog-actions";
import { useToast } from "@/components/ui/use-toast";

type BlogsTableProps = {
  blogs: Blog[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentStatus?: string;
  currentSearch?: string;
};

export function BlogsTable({
  blogs,
  totalCount,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
}: BlogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState(currentSearch || "");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") params.delete("status");
    else params.set("status", status);
    params.delete("page");
    router.push(`/dashboard/blogs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page");
    router.push(`/dashboard/blogs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`/dashboard/blogs?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return badges[status] ?? badges.draft;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog permanently?")) return;
    setDeletingId(id);
    try {
      const result = await deleteBlog(id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: result.error,
        });
        return;
      }
      toast({
        variant: "success",
        title: "Blog deleted",
      });
      if (result.redirectTo) router.push(result.redirectTo);
      else router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 flex flex-col">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, slug..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-3 pr-3 py-2.5"
            />
          </div>
        </form>
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleStatusFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              !currentStatus
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleStatusFilter("published")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              currentStatus === "published"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => handleStatusFilter("draft")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              currentStatus === "draft"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => handleStatusFilter("archived")}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              currentStatus === "archived"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6">
                    Title
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                    Slug
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {blogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No blogs found. Create your first blog to get started.
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                        {blog.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {blog.category || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {blog.slug}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-[11px] font-semibold leading-5 ${getStatusBadge(
                            blog.status
                          )}`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                        {blog.created_at
                          ? new Date(blog.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/dashboard/blogs/${blog.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="text-gray-600 hover:text-gray-900 mr-4"
                          target="_blank"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(blog.id)}
                          disabled={deletingId === blog.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === blog.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * 20, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span> results
            </p>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
