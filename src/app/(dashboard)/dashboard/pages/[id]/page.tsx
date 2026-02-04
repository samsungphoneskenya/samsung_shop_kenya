import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageForm } from "@/components/dashboard/page-form";

export default async function EditPagePage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["admin", "editor"]);

  const supabase = await createClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !page) {
    notFound();
  }
  const { data: seoMeta } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", "page")
    .eq("entity_id", page.id)
    .single();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Page</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update page content and SEO settings.
        </p>
      </div>

      <PageForm page={page} meta_data={seoMeta} />
    </div>
  );
}
