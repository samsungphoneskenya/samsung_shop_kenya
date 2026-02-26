import { createClient } from "@/lib/db/client";
import type { Blog } from "@/lib/actions/blog-actions";

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

