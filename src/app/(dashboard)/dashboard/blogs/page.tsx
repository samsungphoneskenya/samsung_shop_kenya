import { requireRole } from "@/lib/auth/session";
import { BlogsTable } from "@/components/dashboard/blogs-table";
import { getBlogsForDashboard } from "@/lib/queries/blog-queries";
import Link from "next/link";

export const metadata = {
  title: "Blogs",
  description: "Manage blog articles",
};

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { status, search, page: pageParam } = await searchParams;

  const page = Number(pageParam || "1");
  const limit = 20;

  const { blogs, total } = await getBlogsForDashboard({
    page,
    limit,
    status,
    search,
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Blogs Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage blog articles that appear on your storefront.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/blogs/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add New Blog
          </Link>
        </div>
      </div>

      <BlogsTable
        blogs={blogs}
        totalCount={total}
        currentPage={page}
        totalPages={totalPages}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  );
}
