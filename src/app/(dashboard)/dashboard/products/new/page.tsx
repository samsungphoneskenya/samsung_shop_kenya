import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
        <p className="mt-2 text-sm text-gray-700">
          Add a new product to your store catalog.
        </p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  );
}
