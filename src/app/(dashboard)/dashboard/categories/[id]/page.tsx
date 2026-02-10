import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/dashboard/category-form";

export const metadata = {
  title: "Edit Category",
  description: "Edit category or subcategory",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !category) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, level")
    .order("level", { ascending: true })
    .order("display_order", { ascending: true })
    .order("name");

  const parentOptions = (categories || [])
    .filter((c) => c.id !== id)
    .map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level ?? 0,
    }));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Category</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update category details, image, and SEO.
        </p>
      </div>

      <CategoryForm category={category} parentOptions={parentOptions} />
    </div>
  );
}
