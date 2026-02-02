"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pageInsertSchema, pageUpdateSchema } from "../validators/page.schema";

type ActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Create a new page
 */
export async function createPage(
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
    // Extract and validate data
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: (formData.get("content") as string) || null,
      status: formData.get("status") as "draft" | "published",
      created_by: user.id,
      updated_by: user.id,
    };

    // Validate
    const validated = pageInsertSchema.parse(data);

    // Check if slug exists
    const { data: existing } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", validated.slug)
      .single();

    if (existing) {
      return { error: "A page with this slug already exists" };
    }

    // Create page
    const { data: pageData, error } = await supabase
      .from("pages")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    // Create SEO metadata if provided
    const metaTitle = formData.get("meta_title") as string;
    const metaDescription = formData.get("meta_description") as string;
    const canonicalUrl = formData.get("canonical_url") as string;
    const robots = formData.get("robots") as string;

    if (metaTitle || metaDescription || canonicalUrl || robots) {
      await supabase.from("seo_metadata").insert({
        entity_type: "page",
        entity_id: pageData.id,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        canonical_url: canonicalUrl || null,
        robots: robots || "index, follow",
      });
    }

    revalidatePath("/dashboard/pages");
    redirect("/dashboard/pages");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Create page error:", error);
    return { error: error.message || "Failed to create page" };
  }
}

/**
 * Update an existing page
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
    // Extract and validate data
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      content: (formData.get("content") as string) || null,
      status: formData.get("status") as "draft" | "published",
      updated_by: user.id,
    };

    // Validate
    const validated = pageUpdateSchema.parse(data);

    // Check if slug is taken by another page
    const { data: existing } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", validated.slug!)
      .neq("id", pageId)
      .single();

    if (existing) {
      return { error: "A page with this slug already exists" };
    }

    // Update page
    const { error } = await supabase
      .from("pages")
      .update(validated)
      .eq("id", pageId);

    if (error) throw error;

    // Update or create SEO metadata
    const metaTitle = formData.get("meta_title") as string;
    const metaDescription = formData.get("meta_description") as string;
    const canonicalUrl = formData.get("canonical_url") as string;
    const robots = formData.get("robots") as string;

    if (metaTitle || metaDescription || canonicalUrl || robots) {
      const { data: existingSeo } = await supabase
        .from("seo_metadata")
        .select("id")
        .eq("entity_type", "page")
        .eq("entity_id", pageId)
        .single();

      if (existingSeo) {
        // Update existing
        await supabase
          .from("seo_metadata")
          .update({
            meta_title: metaTitle || null,
            meta_description: metaDescription || null,
            canonical_url: canonicalUrl || null,
            robots: robots || "index, follow",
          })
          .eq("id", existingSeo.id);
      } else {
        // Create new
        await supabase.from("seo_metadata").insert({
          entity_type: "page",
          entity_id: pageId,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          canonical_url: canonicalUrl || null,
          robots: robots || "index, follow",
        });
      }
    }

    revalidatePath("/dashboard/pages");
    revalidatePath(`/dashboard/pages/${pageId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update page error:", error);
    return { error: error.message || "Failed to update page" };
  }
}

/**
 * Delete a page
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
