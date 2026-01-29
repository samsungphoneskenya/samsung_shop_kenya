import { createClient } from "@/lib/db/client";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Get the current user session (cached per request)
 * Use this in Server Components
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Get the current user's profile with role
 * Use this when you need role information
 */
export const getCurrentUserProfile = cache(
  async (): Promise<Profile | null> => {
    const user = await getCurrentUser();

    if (!user) return null;

    const supabase = await createClient();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return data as Profile | null;
  }
);

/**
 * Require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Require specific role
 * Redirects to unauthorized page if role doesn't match
 */
export async function requireRole(allowedRoles: string[]) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect("/unauthorized");
  }

  return profile;
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const profile = await getCurrentUserProfile();

  if (!profile) return false;

  // Admin has all permissions
  if (profile.role === "admin") return true;

  // Define permissions per role
  const permissions: Record<string, string[]> = {
    admin: ["*"], // All permissions
    editor: [
      "products.create",
      "products.update",
      "products.delete",
      "categories.create",
      "categories.update",
      "categories.delete",
      "pages.create",
      "pages.update",
      "pages.delete",
      "seo.update",
    ],
    seo_manager: [
      "products.view",
      "seo.create",
      "seo.update",
      "analytics.view",
    ],
  };

  const rolePermissions = permissions[profile.role] || [];

  return rolePermissions.includes("*") || rolePermissions.includes(permission);
}
