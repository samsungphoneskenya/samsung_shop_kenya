import { requireRole } from "@/lib/auth/session";
import { BlogForm } from "@/components/dashboard/blog-form";
import Link from "next/link";

export const metadata = {
  title: "Create blog",
  description: "Create a new blog article",
};

export default async function NewBlogPage() {
  await requireRole(["admin", "editor"]);

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
      <BlogForm />
    </div>
  );
}
