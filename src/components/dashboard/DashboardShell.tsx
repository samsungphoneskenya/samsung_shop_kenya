"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  FileText,
  Search,
  Users,
  BarChart3,
  ChevronLeft,
  Menu,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth/actions";

type Profile = {
  full_name: string | null;
  email: string;
  role: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  show?: (role: string | null) => boolean;
};

export function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reset mobileOpen on pathname change, except if already false.
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        href: "/dashboard/products",
        label: "Products",
        icon: <Package className="h-5 w-5" />,
      },
      {
        href: "/dashboard/orders",
        label: "Orders",
        icon: <ShoppingBag className="h-5 w-5" />,
      },
      {
        href: "/dashboard/categories",
        label: "Categories",
        icon: <Tags className="h-5 w-5" />,
      },
      {
        href: "/dashboard/pages",
        label: "Pages",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        href: "/dashboard/seo",
        label: "SEO",
        icon: <Search className="h-5 w-5" />,
        show: (role) => role === "admin" || role === "seo_manager",
      },
      {
        href: "/dashboard/users",
        label: "Users",
        icon: <Users className="h-5 w-5" />,
        show: (role) => role === "admin",
      },
      {
        href: "/dashboard/blogs",
        label: "blogs",
        icon: <BarChart3 className="h-5 w-5" />,
        show: (role) => role === "admin",
      },
    ],
    []
  );

  const visibleItems = navItems.filter((i) =>
    i.show ? i.show(profile.role) : true
  );
  const name = profile.full_name || profile.email;

  const Sidebar = (
    <aside
      className={`h-full bg-white border-r border-gray-200 ${
        collapsed ? "w-16" : "w-64"
      } transition-[width] duration-200`}
    >
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image
            src="/images/logo.png"
            alt="Samsung Phones Logo"
            width={120}
            height={40}
            className={`h-10 w-auto ${collapsed ? "hidden" : "block"}`}
          />
          <span
            className={`text-sm font-semibold text-gray-900 truncate ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Dashboard
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:inline-flex rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 ${
              collapsed ? "rotate-180" : ""
            } transition-transform`}
          />
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {visibleItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`${active ? "text-white" : "text-gray-600"}`}>
                {item.icon}
              </span>
              <span className={`${collapsed ? "hidden" : "block"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 border-t border-gray-200">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile.role ?? "staff"}
            </p>
          </div>
          <form action={logout} className={`${collapsed ? "" : "ml-auto"}`}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className={`${collapsed ? "hidden" : "block"}`}>
                Logout
              </span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{Sidebar}</div>

        {/* Mobile sidebar (off-canvas) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {Sidebar}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex lg:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-gray-900 hidden sm:block">
                {name}
                {profile.role ? (
                  <span className="ml-2 text-xs font-medium text-gray-500">
                    ({profile.role})
                  </span>
                ) : null}
              </p>
            </div>

            <form action={logout} className="lg:hidden">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </header>

          <main className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
