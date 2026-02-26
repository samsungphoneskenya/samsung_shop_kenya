import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Link from "next/link";
import { getPublishedBlogs } from "@/lib/queries/blog-queries";

export const metadata = {
  title: "Blog | Samsung Shop Kenya",
  description:
    "Guides, tips, and news about Samsung phones, tablets, and accessories in Kenya.",
};

export default async function BlogIndexPage() {
  const blogs = await getPublishedBlogs(24);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-slate-500 uppercase mb-2">
            Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Guides & stories from Samsung Shop Kenya
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Learn how to choose the right Galaxy device, get more from your
            phone, and stay updated on the latest offers.
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center text-sm text-slate-600">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600 mb-1">
                  {blog.category || "Article"}
                </p>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  {blog.title}
                </h2>
                {blog.meta_description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                    {blog.meta_description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {blog.created_at
                      ? new Date(blog.created_at).toLocaleDateString()
                      : ""}
                  </span>
                  <span className="font-semibold text-sky-700 group-hover:text-sky-900">
                    Read article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
