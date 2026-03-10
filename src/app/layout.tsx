import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ui/use-toast";
import SchemaMarkup from "./SchemaMarkup";

export const metadata: Metadata = {
  title: "Samsung Kenya Official Online Store | Galaxy S26 Ultra & Z Fold 8",
  description:
    "Official Samsung dealer in Kenya. Shop the new Galaxy S26 Ultra with Privacy Display, Galaxy A57 5G, and Z Fold 8. Genuine 24-month warranty, official Samsung Care+, and same-day delivery in Nairobi.",
  keywords: [
    "Samsung Kenya Official Website in Kenya",
    "Samsung Galaxy S26 Ultra price Kenya",
    "Buy Samsung S26 Nairobi",
    "Samsung Galaxy A57 5G Kenya",
    "Samsung Z Fold 8 release Kenya",
    "Official Samsung Service Center Nairobi",
    "Samsung accessories Kenya",
    "Samsung new phone",
    "Samsung website",
  ],
  alternates: {
    canonical: "https://samsungphones.co.ke",
  },
  openGraph: {
    title: "Samsung Kenya Official Online Store",
    description: "Buy original Samsung phones in Kenya with official warranty.",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
        <SpeedInsights />
        <SchemaMarkup />
      </body>
    </html>
  );
}
