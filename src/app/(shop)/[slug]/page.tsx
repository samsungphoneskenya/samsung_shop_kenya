import { createClient } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!page) {
    return { title: "Page Not Found" };
  }

  const { data: seoMeta } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("entity_type", "page")
    .eq("entity_id", page.id)
    .single();

  return {
    title: seoMeta?.meta_title || page.title,
    description: seoMeta?.meta_description || undefined,
    robots: seoMeta?.robots || "index, follow",
    alternates: {
      canonical: seoMeta?.canonical_url || undefined,
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: page, error } = await supabase
    .from("pages")
    .select("*, seo_metadata(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !page) {
    notFound();
  }

  // Simple markdown-to-HTML conversion
  const formatContent = (content: string | null) => {
    if (!content) return "";

    return (
      content
        // Headers
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>'
        )
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Links
        .replace(
          /\[(.*?)\]\((.*?)\)/g,
          '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
        )
        // Lists
        .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p class="mb-4">')
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg px-8 py-12">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {page.title}
            </h1>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-4">${formatContent(page.content)}</p>`,
              }}
            />

            {/* Updated Date */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {page.updated_at &&
                  new Date(page.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </p>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
