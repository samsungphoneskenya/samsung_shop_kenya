import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

const STAFF_ROLES = ["admin", "editor", "seo_manager"];

export default async function SignupPage() {
  const profile = await getCurrentUserProfile();
  if (profile) {
    redirect(STAFF_ROLES.includes(profile.role ?? "") ? "/dashboard" : "/account");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
              sign in to existing account
          </Link>
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
