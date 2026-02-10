import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { CategoriesTable } from "@/components/dashboard/categories-table";

export const metadata = {
  title: "Categories",
  description: "Manage product categories",
};

export default async function CategoriesPage() {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*, parent:categories!parent_id(name)")
    .order("level", { ascending: true })
    .order("display_order", { ascending: true })
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-700">
            Organize your products into categories for better navigation.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Category
          </Link>
        </div>
      </div>

      <CategoriesTable categories={categories || []} />
    </div>
  );
}
