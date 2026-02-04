"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

type ActionResult = {
  error?: string;
  success?: boolean;
};

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<ActionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return { error: "Only admins can change user roles" };
  }

  // Prevent user from removing their own admin role
  if (userId === currentUser.id && newRole !== "admin") {
    return { error: "You cannot remove your own admin role" };
  }

  // Validate role
  if (!["admin", "editor", "seo_manager"].includes(newRole)) {
    return { error: "Invalid role" };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) throw error;

    // Log the activity
    await supabase.rpc("log_user_activity", {
      p_user_id: currentUser.id,
      p_action: "role_changed",
      p_entity_type: "profile",
      p_entity_id: userId,
      p_description: `Changed user role to ${newRole}`,
      p_metadata: { new_role: newRole, changed_by: currentUser.id },
    });

    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${userId}`);

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update role error:", error);
    return { error: error.message || "Failed to update role" };
  }
}

/**
 * Log user activity (for manual logging)
 */
export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  description?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();

  await supabase.rpc("log_user_activity", {
    p_user_id: user.id,
    p_action: action,
    p_entity_type: entityType || undefined,
    p_entity_id: entityId || undefined,
    p_description: description || null,
    p_metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

/**
 * Get user activity logs
 */
export async function getUserActivity(userId: string, limit: number = 50) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Check if current user is admin or viewing their own logs
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (currentProfile?.role !== "admin" && userId !== currentUser.id) {
    throw new Error("Unauthorized to view activity logs");
  }

  const { data, error } = await supabase
    .from("user_activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Get all recent activity (admin only)
 */
export async function getRecentActivity(limit: number = 100) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Check if current user is admin
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  if (currentProfile?.role !== "admin") {
    throw new Error("Only admins can view all activity");
  }

  const { data, error } = await supabase
    .from("user_activity_logs")
    .select("*")
    .limit(limit);

  if (error) throw error;

  return data;
}
