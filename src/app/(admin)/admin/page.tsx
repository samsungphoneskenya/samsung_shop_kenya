"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Client-side auth confirmed.</p>
    </div>
  );
}
