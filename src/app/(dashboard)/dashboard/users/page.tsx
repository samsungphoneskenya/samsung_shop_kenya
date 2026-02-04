import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { UsersTable } from "@/components/dashboard/users-table";

export const metadata = {
  title: "User Management",
  description: "Manage users and roles",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>;
}) {
  await requireRole(["admin"]);
  const { role, search } = await searchParams;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (role) {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Get role counts
  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  const { count: editorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "editor");

  const { count: seoCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seo_manager");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {adminCount || 0} Admins
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {editorCount || 0} Editors
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {seoCount || 0} SEO Managers
          </span>
        </div>
      </div>

      <UsersTable
        users={users || []}
        currentRole={role}
        currentSearch={search}
      />
    </div>
  );
}
