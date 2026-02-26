import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { getBlogById } from "@/lib/queries/blog-queries";
import { BlogForm } from "@/components/dashboard/blog-form";
import Link from "next/link";

export const metadata = {
  title: "Edit blog",
  description: "Edit blog article",
};

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;

  const blog = await getBlogById(id);
  if (!blog) notFound();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Link
          href="/dashboard/blogs"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to blogs
        </Link>
      </div>
      <BlogForm blog={blog} />
    </div>
  );
}
