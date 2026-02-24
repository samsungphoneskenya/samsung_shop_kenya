import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Samsung Phones Kenya- Official Online Store",
  description:
    "We provide you with original samsung phones at a competitive price",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
