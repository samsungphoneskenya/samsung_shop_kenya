import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageForm } from "@/components/dashboard/page-form";
import { SITE_PAGE_SLUGS } from "@/lib/types/page-sections";

export default async function EditPageBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole(["admin", "editor"]);

  const { slug } = await params;
  if (!SITE_PAGE_SLUGS.includes(slug as "home" | "about-us" | "contact-us")) {
    notFound();
  }

  const supabase = await createClient();
  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !page) {
    notFound();
  }

  const pageTitle =
    slug === "home"
      ? "Home"
      : slug === "about-us"
        ? "About Us"
        : "Contact Us";

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit {pageTitle}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Update sections, text, and images for this page. Changes appear on the live site.
        </p>
      </div>

      <PageForm page={page} />
    </div>
  );
}
