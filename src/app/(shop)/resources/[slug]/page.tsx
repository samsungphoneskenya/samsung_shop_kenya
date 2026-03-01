import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getPublishedBlogs } from "@/lib/queries/blog-queries";
import BlogCta from "@/components/blogs/blogsCTA";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) {
    return {
      title: "Article not found | Samsung Shop Kenya",
      description: "The requested article could not be found.",
    };
  }
  return {
    title: blog.meta_title || `${blog.title} | Samsung Shop Kenya`,
    description:
      blog.meta_description ||
      (blog.content_html || "").replace(/<[^>]+>/g, " ").slice(0, 150),
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) notFound();

  const more = await getPublishedBlogs(3);
  const moreFiltered = more.filter((b) => b.slug !== slug);

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-xs text-slate-500 flex flex-wrap gap-1"
        >
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-slate-900">
            Resources
          </Link>
          <span>/</span>
          <span className="text-slate-900 line-clamp-1">{blog.title}</span>
        </nav>

        {/* Two-column layout: article + CTA sidebar */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ── Left: main content ── */}
          <div className="flex-1 min-w-0">
            <header className="mb-8">
              {blog.category && (
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-sky-600 mb-2">
                  {blog.category}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
                {blog.title}
              </h1>
              <p className="text-xs text-slate-500">
                {blog.created_at
                  ? new Date(blog.created_at).toLocaleDateString()
                  : ""}
              </p>
            </header>

            {blog.cover_image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.cover_image_url}
                  alt={blog.cover_image_alt || blog.title}
                  className="w-full h-auto max-h-[360px] object-cover"
                />
              </div>
            )}

            <article className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:scroll-mt-24 prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-table:border prose-table:border-slate-200 prose-th:border prose-th:border-slate-200 prose-td:border prose-td:border-slate-200">
              <div
                dangerouslySetInnerHTML={{ __html: blog.content_html || "" }}
              />
            </article>

            {/* More articles */}
            {moreFiltered.length > 0 && (
              <section className="mt-12 border-t border-slate-200 pt-8">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">
                  More from our blog
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {moreFiltered.map((b) => (
                    <Link
                      key={b.id}
                      href={`/blog/${b.slug}`}
                      className="group rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-900 hover:-translate-y-0.5 hover:shadow-md transition-all"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600 mb-1">
                        {b.category || "Article"}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950 line-clamp-2">
                        {b.title}
                      </h3>
                      {b.created_at && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {new Date(b.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right: sticky CTA sidebar ── */}
          <div className="w-full sticky top-36 lg:w-72 xl:w-80 shrink-0">
            <BlogCta
              title="Looking for a Samsung Device?"
              description="Browse our full range of Samsung smartphones, tablets, and accessories with genuine warranty and fast delivery across Kenya."
              features={[
                "Genuine Samsung Products",
                "Countrywide Delivery",
                "Warranty Included",
              ]}
              shopHref="/shop"
              shopLabel="Shop Now"
              whatsappHref="https://wa.me/254768378439"
              whatsappLabel="Chat with an Expert"
            />
          </div>
        </div>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
