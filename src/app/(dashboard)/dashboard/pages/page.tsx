import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { PagesTable } from "@/components/dashboard/pages-table";

export const metadata = {
  title: "Pages",
  description: "Manage your website pages",
};

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();
  const { status, search } = await searchParams;

  // Build query
  let query = supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: pages, error } = await query;

  if (error) {
    console.error("Error fetching pages:", error);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage custom pages like About, Contact, Terms, and more.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/pages/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Page
          </Link>
        </div>
      </div>

      <PagesTable
        pages={pages || []}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  );
}
