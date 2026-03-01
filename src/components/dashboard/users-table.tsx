"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { updateUserRole } from "@/lib/actions/user-actions";
import { Database } from "@/types/database.types";
import { useToast } from "@/components/ui/use-toast";

type User = Database["public"]["Tables"]["profiles"]["Row"];

type UsersTableProps = {
  users: User[];
  currentRole?: string;
  currentSearch?: string;
};

export function UsersTable({
  users,
  currentRole,
  currentSearch,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState(currentSearch || "");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role === "all") {
      params.delete("role");
    } else {
      params.set("role", role);
    }
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (
      !confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Unable to update role",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Role updated",
          description: "The user role has been updated successfully.",
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Something went wrong while updating this role.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: "bg-purple-100 text-purple-800",
      editor: "bg-blue-100 text-blue-800",
      seo_manager: "bg-green-100 text-green-800",
      customer: "bg-yellow-100 text-yellow-800",
    };
    return badges[role as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="mt-8 flex flex-col">
      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </form>

        {/* Role Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => handleRoleFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              !currentRole
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter("admin")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentRole === "admin"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => handleRoleFilter("editor")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentRole === "editor"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Editors
          </button>
          <button
            onClick={() => handleRoleFilter("seo_manager")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentRole === "seo_manager"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            SEO Managers
          </button>
          <button
            onClick={() => handleRoleFilter("customer")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentRole === "customer"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Customers
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    User
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.full_name?.charAt(0).toUpperCase() ||
                                  user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {user.full_name || "No name"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={user?.role ?? ""}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={updatingUserId === user.id}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadge(
                            user?.role ?? ""
                          )} border-0 focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="seo_manager">SEO Manager</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.created_at &&
                          new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/users/${user.id}/activity`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Activity
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
