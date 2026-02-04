import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const robotsTxt = `# robots.txt
User-agent: *
Allow: /

# Disallow admin and dashboard
Disallow: /dashboard
Disallow: /api

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
