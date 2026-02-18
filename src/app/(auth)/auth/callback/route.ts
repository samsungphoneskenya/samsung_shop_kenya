import { createClient } from "@/lib/db/client";
import { NextResponse } from "next/server";

const STAFF_ROLES = ["admin", "editor", "seo_manager"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  let redirectPath = `${origin}/account`;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role && STAFF_ROLES.includes(profile.role)) {
        redirectPath = `${origin}/dashboard`;
      }
    }
  }

  return NextResponse.redirect(redirectPath);
}
