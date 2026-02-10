import { requireRole } from "@/lib/auth/session";
import { getSitePages } from "@/lib/actions/page-actions";
import { PagesTable } from "@/components/dashboard/pages-table";

export const metadata = {
  title: "Site Pages",
  description: "Edit content and sections of your site pages",
};

export default async function PagesPage() {
  await requireRole(["admin", "editor"]);

  const pages = await getSitePages();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Site Pages</h1>
          <p className="mt-2 text-sm text-gray-700">
            Edit sections and text on your homepage, about, and contact pages. All content is dynamic.
          </p>
        </div>
      </div>

      <PagesTable pages={pages} />
    </div>
  );
}
