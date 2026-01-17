import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/db/middleware-client";

export async function proxy(request: NextRequest) {
  const { supabase, response } = await createClient(request);

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protect dashboard routes
  if (path.startsWith("/dashboard")) {
    if (!user) {
      // Redirect to login
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }

    // Optional: Check for specific roles
    // const userRole = user.user_metadata?.role
    // if (path.startsWith('/dashboard/admin') && userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url))
    // }
  }

  // Protect API routes
  if (path.startsWith("/api/")) {
    // Skip auth check for public APIs
    const publicPaths = ["/api/webhooks"];
    if (publicPaths.some((p) => path.startsWith(p))) {
      return response;
    }

    // Require auth for protected APIs
    if (!user && !path.startsWith("/api/auth")) {
      return new NextResponse(
        JSON.stringify({
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
