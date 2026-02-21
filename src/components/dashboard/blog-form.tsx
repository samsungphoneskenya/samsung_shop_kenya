"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import type { Blog } from "@/lib/actions/blog-actions";
import { createBlog, updateBlog } from "@/lib/actions/blog-actions";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
} | null;

type BlogFormProps = {
  blog?: Blog | null;
};

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = !blog;

  const [formData, setFormData] = useState({
    title: blog?.title ?? "",
    slug: blog?.slug ?? "",
    category: blog?.category ?? "",
    status: blog?.status ?? "draft",
    meta_title: blog?.meta_title ?? "",
    meta_description: blog?.meta_description ?? "",
    meta_keywords: (blog?.meta_keywords ?? []).join(", "),
    content_html: blog?.content_html ?? "",
    cover_image_url: blog?.cover_image_url ?? "",
    cover_image_alt: blog?.cover_image_alt ?? "",
  });

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleField =
    (field: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "title" && isNew && !prev.slug) {
          next.slug = generateSlug(value);
        }
        return next;
      });
    };

  const action = isNew ? createBlog : updateBlog.bind(null, blog!.id);

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, fd) => {
      const result = await action(null, fd);
      if (result.error) {
        return { error: result.error };
      }
      return {
        success: true,
        redirectTo: result.redirectTo,
      };
    },
    null
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Unable to save blog",
        description: state.error,
      });
      return;
    }
    if (state.success) {
      toast({
        variant: "success",
        title: isNew ? "Blog created" : "Blog updated",
        description: "Your article has been saved.",
      });
      if (state.redirectTo) router.push(state.redirectTo);
      else router.refresh();
    }
  }, [state, toast, isNew, router]);

  return (
    <form action={formAction} className="max-w-6xl mx-auto text-black">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Create Blog" : "Edit Blog"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Write rich content with full formatting, images, and tables.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-5 grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Blog Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleField("title")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Best Samsung phones for 2026"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Meta Title
            </label>
            <input
              name="meta_title"
              value={formData.meta_title}
              onChange={handleField("meta_title")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Category
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleField("category")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="How-To Guides"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Slug (URL)
            </label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleField("slug")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="best-samsung-phones-2026"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Meta Keywords
            </label>
            <input
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleField("meta_keywords")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="samsung, galaxy, how-to"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleField("status")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Cover image URL
            </label>
            <input
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleField("cover_image_url")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="/images/blog/hero.jpg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Cover image alt
            </label>
            <input
              name="cover_image_alt"
              value={formData.cover_image_alt}
              onChange={handleField("cover_image_alt")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Galaxy phones on table"
            />
          </div>
        </div>
        <div className="px-6 pb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Meta Description
          </label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleField("meta_description")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Short summary used in search and social."
          />
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">
            Article content
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Use the toolbar to add headings, lists, images, tables, highlights,
            and more.
          </p>
        </div>
        <div className="px-6 py-5">
          <RichTextEditor
            name="content_html"
            value={formData.content_html}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, content_html: html }))
            }
            placeholder="Start writing your article..."
            minHeight={320}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/blogs")}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : isNew ? "Create Blog" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
