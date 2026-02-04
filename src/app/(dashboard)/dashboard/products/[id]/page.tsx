import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product with images (seo_metadata has no FK to products, fetch separately)
  const { data: product, error } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch seo_metadata separately (polymorphic: entity_type + entity_id)
  const { data: seoMetadata } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", "product")
    .eq("entity_id", id)
    .maybeSingle();

  const productWithSeo = { ...product, seo_metadata: seoMetadata };

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update product information, pricing, and SEO settings.
        </p>
      </div>

      <ProductForm product={productWithSeo} categories={categories || []} />
    </div>
  );
}
