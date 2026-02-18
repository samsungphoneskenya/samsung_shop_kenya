import { Metadata } from "next";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/lib/actions/account-actions";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "My Profile | Samsung Shop Kenya",
  description: "View and edit your account details",
};

const STAFF_ROLES = ["admin", "editor", "seo_manager"];

export default async function AccountProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");
  if (STAFF_ROLES.includes(profile.role ?? "")) redirect("/dashboard");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile details</h2>
      <ProfileForm profile={profile} />
    </div>
  );
}
