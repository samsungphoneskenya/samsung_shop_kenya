import { requireRole } from "@/lib/auth/session";

export const metadata = {
  title: "Permissions Reference",
  description: "Role-based permissions guide",
};

export default async function PermissionsPage() {
  await requireRole(["admin"]);

  const permissions = {
    admin: {
      name: "Administrator",
      color: "purple",
      description: "Full system access with all permissions",
      permissions: [
        "Full access to all features",
        "User management",
        "Role assignment",
        "System configuration",
        "View all activity logs",
        "Delete any content",
        "Manage orders",
        "Manage products",
        "Manage pages",
        "Manage categories",
        "SEO management",
        "Analytics access",
      ],
    },
    editor: {
      name: "Editor",
      color: "blue",
      description: "Content creation and management",
      permissions: [
        "Create, edit, delete products",
        "Create, edit, delete pages",
        "Create, edit, delete categories",
        "Upload and manage images",
        "Update SEO metadata",
        "View own activity logs",
        "Cannot manage users",
        "Cannot delete orders",
        "Cannot access system settings",
      ],
    },
    seo_manager: {
      name: "SEO Manager",
      color: "green",
      description: "SEO optimization and analysis",
      permissions: [
        "View all products and pages",
        "Update SEO metadata",
        "Run SEO audits",
        "Manage sitemaps",
        "Generate schema markup",
        "View analytics",
        "View own activity logs",
        "Cannot edit content",
        "Cannot manage users",
        "Cannot manage orders",
      ],
    },
    customer: {
      name: "Customer",
      color: "yellow",
      description: "View and Edit their personal details and orders only",
      permissions: [
        "Can view orders attached to their ID",
        "Can give reviews of orders with their ID",
        "Can update and view personal details i.e name, email and phone numbers",
        "Cannot view products and pages",
        "Cannot Update SEO metadata",
        "Cannot Run SEO audits",
        "Cannot Manage sitemaps",
        "Cannot Generate schema markup",
        "Cannot View analytics",
        "Cannot View own activity logs",
        "Cannot edit content",
        "Cannot manage users",
        "Cannot manage orders",
      ],
    },
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Permissions Reference
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Complete guide to role-based permissions in the system.
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Object.entries(permissions).map(([role, data]) => (
          <div
            key={role}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div
              className={`px-6 py-4 bg-${data.color}-50 border-b border-${data.color}-100`}
            >
              <h3 className={`text-lg font-medium text-${data.color}-900`}>
                {data.name}
              </h3>
              <p className={`mt-1 text-sm text-${data.color}-700`}>
                {data.description}
              </p>
            </div>
            <div className="px-6 py-4">
              <ul className="space-y-3">
                {data.permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className={`h-5 w-5 text-${data.color}-500 mr-2 flex-shrink-0`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {permission.startsWith("Cannot") ? (
                        <path
                          fillRule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <span
                      className={`text-sm ${
                        permission.startsWith("Cannot")
                          ? "text-gray-500"
                          : "text-gray-700"
                      }`}
                    >
                      {permission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Permission Matrix
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Detailed breakdown of access levels by feature
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Editor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Manager
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  feature: "Products",
                  admin: "Full",
                  editor: "Full",
                  seo: "View + SEO",
                },
                {
                  feature: "Pages",
                  admin: "Full",
                  editor: "Full",
                  seo: "View + SEO",
                },
                {
                  feature: "Categories",
                  admin: "Full",
                  editor: "Full",
                  seo: "View",
                },
                {
                  feature: "Orders",
                  admin: "Full",
                  editor: "View",
                  seo: "None",
                },
                {
                  feature: "Users",
                  admin: "Full",
                  editor: "None",
                  seo: "None",
                },
                {
                  feature: "SEO Tools",
                  admin: "Full",
                  editor: "Full",
                  seo: "Full",
                },
                {
                  feature: "Analytics",
                  admin: "Full",
                  editor: "View",
                  seo: "View",
                },
                {
                  feature: "Images",
                  admin: "Full",
                  editor: "Full",
                  seo: "View",
                },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {row.admin}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {row.editor}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {row.seo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Best Practices
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Assign the minimum role required for each user&apos;s
                  responsibilities
                </li>
                <li>
                  Regularly review user roles and remove unnecessary access
                </li>
                <li>
                  Use SEO Manager role for team members focused only on SEO
                </li>
                <li>Limit Admin role to core team members only</li>
                <li>Monitor activity logs for unusual access patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
