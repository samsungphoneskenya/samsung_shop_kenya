import { SchemaGenerator } from "@/components/dashboard/schema-generator";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/db/client";

export const metadata = {
  title: "Schema Markup Generator",
  description: "Generate structured data for rich snippets",
};

export default async function SchemaPage({
  searchParams,
}: {
  searchParams: { type?: "product" | "page"; id?: string };
}) {
  await requireRole(["admin", "editor", "seo_manager"]);

  const supabase = await createClient();

  let entityData = null;

  if (searchParams.id && searchParams.type) {
    if (searchParams.type === "product") {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("id", searchParams.id)
        .single();
      entityData = data;
    } else if (searchParams.type === "page") {
      const { data } = await supabase
        .from("pages")
        .select("*, seo_metadata(*)")
        .eq("id", searchParams.id)
        .single();
      entityData = data;
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Schema Markup Generator
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Generate JSON-LD structured data for rich search results.
        </p>
      </div>

      <SchemaGenerator entityData={entityData} />
    </div>
  );
}
