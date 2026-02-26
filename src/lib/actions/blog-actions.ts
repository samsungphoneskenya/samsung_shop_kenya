"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type BlogStatus = "draft" | "published" | "archived";

export type Blog = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: BlogStatus;
  content_html: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: string | null;
  updated_at: string | null;
};

type ActionResult = {
  error?: string;
  success?: boolean;
  blogId?: string;
  redirectTo?: string;
};

const STAFF_ROLES = ["admin", "editor"] as const;

async function requireStaff(): Promise<{ ok: boolean; error?: string }> {
  const profile = await getCurrentUserProfile();
  if (!profile) return { ok: false, error: "Unauthorized" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!STAFF_ROLES.includes((profile.role ?? "") as any)) {
    return { ok: false, error: "Forbidden" };
  }
  return { ok: true };
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getBlogsForDashboard(options: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) {
  const supabase = await createClient();
  const page = options.page || 1;
  const limit = options.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from("blogs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.search?.trim()) {
    const s = options.search.trim();
    query = query.or(
      `title.ilike.%${s}%,category.ilike.%${s}%,slug.ilike.%${s}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.log("Error fetching blogs:", error);
    return { blogs: [] as Blog[], total: 0 };
  }
  return { blogs: (data ?? []) as Blog[], total: count ?? 0 };
}

export async function getPublishedBlogs(limit = 12) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.log("Error fetching published blogs:", error);
    return [] as Blog[];
  }
  return (data ?? []) as Blog[];
}

export async function getBlogBySlug(slug: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.log("Error fetching blog:", error);
    return null;
  }
  return data as Blog;
}

export async function getBlogById(id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Error fetching blog by id:", error);
    return null;
  }
  return data as Blog;
}

export async function createBlog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireStaff();
  if (!auth.ok) return { error: auth.error };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slugInput = (formData.get("slug") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() || null;
  const meta_title =
    (formData.get("meta_title") as string | null)?.trim() || null;
  const meta_description =
    (formData.get("meta_description") as string | null)?.trim() || null;
  const meta_keywords_raw =
    (formData.get("meta_keywords") as string | null) ?? "";
  const status = (formData.get("status") as BlogStatus) || "draft";
  const content_html =
    (formData.get("content_html") as string | null)?.trim() ?? "";
  const cover_image_url =
    (formData.get("cover_image_url") as string | null)?.trim() || null;
  const cover_image_alt =
    (formData.get("cover_image_alt") as string | null)?.trim() || null;

  if (!title) return { error: "Title is required" };
  if (!content_html) return { error: "Content is required" };

  const slug = normalizeSlug(slugInput || title);
  if (!slug) return { error: "Slug is required" };

  const meta_keywords = meta_keywords_raw
    ? meta_keywords_raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : null;

  const supabase = await createClient();

  // Ensure slug unique
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("blogs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) return { error: "A blog with this slug already exists" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("blogs")
    .insert({
      title,
      slug,
      category,
      status,
      content_html,
      cover_image_url,
      cover_image_alt,
      meta_title,
      meta_description,
      meta_keywords,
    })
    .select("id")
    .single();

  if (error) {
    console.log("Create blog error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/blogs");
  revalidatePath("/blog");

  return {
    success: true,
    blogId: data.id as string,
    redirectTo: `/dashboard/blogs/${data.id}`,
  };
}

export async function updateBlog(
  blogId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireStaff();
  if (!auth.ok) return { error: auth.error };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slugInput = (formData.get("slug") as string | null)?.trim() ?? "";
  const category = (formData.get("category") as string | null)?.trim() || null;
  const meta_title =
    (formData.get("meta_title") as string | null)?.trim() || null;
  const meta_description =
    (formData.get("meta_description") as string | null)?.trim() || null;
  const meta_keywords_raw =
    (formData.get("meta_keywords") as string | null) ?? "";
  const status = (formData.get("status") as BlogStatus) || "draft";
  const content_html =
    (formData.get("content_html") as string | null)?.trim() ?? "";

  if (!title) return { error: "Title is required" };
  if (!content_html) return { error: "Content is required" };

  const slug = normalizeSlug(slugInput || title);
  if (!slug) return { error: "Slug is required" };

  const meta_keywords = meta_keywords_raw
    ? meta_keywords_raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : null;

  const supabase = await createClient();

  // Ensure slug unique among other blogs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("blogs")
    .select("id")
    .eq("slug", slug)
    .neq("id", blogId)
    .maybeSingle();

  if (existing) return { error: "A blog with this slug already exists" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("blogs")
    .update({
      title,
      slug,
      category,
      status,
      content_html,
      cover_image_url:
        (formData.get("cover_image_url") as string | null)?.trim() || null,
      cover_image_alt:
        (formData.get("cover_image_alt") as string | null)?.trim() || null,
      meta_title,
      meta_description,
      meta_keywords,
    })
    .eq("id", blogId);

  if (error) {
    console.log("Update blog error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/blogs");
  revalidatePath(`/dashboard/blogs/${blogId}`);
  revalidatePath("/blog");

  return { success: true, blogId, redirectTo: `/dashboard/blogs/${blogId}` };
}

export async function deleteBlog(blogId: string): Promise<ActionResult> {
  const auth = await requireStaff();
  if (!auth.ok) return { error: auth.error };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("blogs")
    .delete()
    .eq("id", blogId);

  if (error) {
    console.log("Delete blog error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/blogs");
  revalidatePath("/blog");
  return { success: true, redirectTo: "/dashboard/blogs" };
}
