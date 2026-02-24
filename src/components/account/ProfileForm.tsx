"use client";

import { useActionState } from "react";
import { updateCustomerProfile } from "@/lib/actions/account-actions";
import type { Database } from "@/types/database.types";
import { logout } from "@/lib/auth/actions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | null,
      formData: FormData
    ) => {
      return updateCustomerProfile(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-800">
          Profile updated.
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          defaultValue={profile.email}
          disabled
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
      </div>
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={profile.full_name ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your name"
        />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. 07XXXXXXXX"
        />
      </div>
      <div className="flex space-between w-full">
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Save changes
        </button>
        <button
          type="submit"
          onClick={logout}
          className="ml-3 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </form>
  );
}
