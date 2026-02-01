import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import { ProductsTable } from "@/components/dashboard/products-table";

export const metadata = {
  title: "Products",
  description: "Manage your products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  // Require editor or admin role
  await requireRole(["admin", "editor"]);

  const { status, search, page: searchParamsPage } = await searchParams;

  const supabase = await createClient();
  const page = parseInt(searchParamsPage || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("products")
    .select("*, category:categories(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: products, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your store including their title, status,
            price, and category.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Product
          </Link>
        </div>
      </div>

      <ProductsTable
        products={products || []}
        totalCount={count || 0}
        currentPage={page}
        totalPages={totalPages}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  );
}
