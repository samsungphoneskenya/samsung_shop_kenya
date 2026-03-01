import { createClient } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { getUserActivity } from "@/lib/actions/user-actions";
import { UserActivityLog } from "@/components/dashboard/user-activity-log";
import Link from "next/link";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const { id } = await params;

  // Get user
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !user) {
    notFound();
  }

  // Get activity logs
  const activityLogs = await getUserActivity(id, 50);

  // Get stats
  const { count: productsCreated } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("created_by", id);

  const { count: pagesCreated } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("created_by", id);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.full_name || user.email}
            </h1>
            <p className="mt-2 text-sm text-gray-700">{user.email}</p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              user.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : user.role === "editor"
                ? "bg-blue-100 text-blue-800"
                : user.role === "seo_manager"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {user.role === "admin"
              ? "Admin"
              : user.role === "editor"
              ? "Editor"
              : user.role === "seo_manager"
              ? "SEO Manager"
              : "Customer"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Products Created
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {productsCreated || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pages Created
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {pagesCreated || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Member Since
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {user.created_at &&
                      new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <UserActivityLog activities={activityLogs} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Users
        </Link>
      </div>
    </div>
  );
}
