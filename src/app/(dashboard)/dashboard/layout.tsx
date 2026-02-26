import { requireAuth, getCurrentUserProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const STAFF_ROLES = ["admin", "editor", "seo_manager"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const profile = await getCurrentUserProfile();

  // Customers have no access to the dashboard; redirect to their account
  if (!profile || !STAFF_ROLES.includes(profile.role ?? "")) {
    redirect("/account");
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
