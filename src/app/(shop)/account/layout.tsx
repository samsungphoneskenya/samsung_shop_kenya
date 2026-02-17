import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import {
  User,
  Package,
  MapPin,
  Heart,
} from "lucide-react";
import { requireCustomer } from "@/lib/actions/account-actions";

const nav = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/favourites", label: "Favourites", icon: Heart },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireCustomer();
  if (!ctx) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <nav className="w-full md:w-56 shrink-0">
            <ul className="space-y-1 border border-gray-200 rounded-xl bg-white p-2 shadow-sm">
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
