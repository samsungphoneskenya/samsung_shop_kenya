"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageUpdateSchema } from "../validators/page.schema";
import type { PageSections } from "@/lib/types/page-sections";

type ActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Get a single page by slug (for site pages: home, about-us, contact-us)
 */
export async function getPageBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as typeof data & { sections: PageSections | null };
}

/**
 * Get all fixed site pages (home, about-us, contact-us)
 */
export async function getSitePages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .in("slug", ["home", "about-us", "contact-us"])
    .order("slug");

  if (error) {
    console.error("Error fetching site pages:", error);
    return [];
  }
  return (data ?? []) as (typeof data[0] & { sections: PageSections | null })[];
}

/**
 * Update an existing page (title, meta, status, sections).
 * Used for editing section content on fixed site pages.
 */
export async function updatePage(
  pageId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const sectionsRaw = formData.get("sections") as string | null;
    let sections: PageSections | null = null;
    if (sectionsRaw) {
      try {
        sections = JSON.parse(sectionsRaw) as PageSections;
      } catch {
        // keep existing sections if parse fails
      }
    }

    const data = {
      title: (formData.get("title") as string) || undefined,
      status: (formData.get("status") as "draft" | "published") || undefined,
      meta_title: (formData.get("meta_title") as string) || null,
      meta_description: (formData.get("meta_description") as string) || null,
      ...(sections !== null && { sections }),
    };

    const validated = pageUpdateSchema.parse(data);

    const { error } = await supabase
      .from("pages")
      .update(validated)
      .eq("id", pageId);

    if (error) throw error;

    revalidatePath("/dashboard/pages");
    revalidatePath(`/dashboard/pages/[slug]`);
    revalidatePath("/");
    revalidatePath("/about-us");
    revalidatePath("/contact-us");

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update page";
    console.error("Update page error:", err);
    return { error: message };
  }
}

/**
 * Delete a page (only for non-fixed pages if you add custom pages later)
 */
export async function deletePage(pageId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/pages");
  redirect("/dashboard/pages");
}
