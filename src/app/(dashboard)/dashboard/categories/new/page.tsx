import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { CategoryForm } from "@/components/dashboard/category-form";

export const metadata = {
  title: "New Category",
  description: "Create a new category or subcategory",
};

export default async function NewCategoryPage() {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, level")
    .order("level", { ascending: true })
    .order("display_order", { ascending: true })
    .order("name");

  const parentOptions = (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level ?? 0,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Category</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a top-level category or a subcategory under an existing one.
        </p>
      </div>

      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
