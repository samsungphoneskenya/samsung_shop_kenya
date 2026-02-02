import { PageForm } from "@/components/dashboard/page-form";
import { requireRole } from "@/lib/auth/session";

export default async function NewPagePage() {
  await requireRole(["admin", "editor"]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Page</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new page for your website.
        </p>
      </div>

      <PageForm />
    </div>
  );
}
