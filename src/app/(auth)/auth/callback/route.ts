import { createClient } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Ensure a corresponding profile exists (and keep it in sync)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      // Derive a default role: first user becomes admin, others editor
      let role = existingProfile?.role;

      if (!existingProfile) {
        const { count: adminCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "admin");

        role = adminCount && adminCount > 0 ? "editor" : "admin";

        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name:
            // Common Supabase providers
            (user.user_metadata as Record<string, unknown>)?.full_name ??
            (user.user_metadata as Record<string, unknown>)?.name ??
            null,
          avatar_url:
            (user.user_metadata as Record<string, unknown>)?.avatar_url ??
            null,
          role,
          is_active: true,
          is_verified: Boolean(user.email_confirmed_at),
        });
      } else {
        // Keep core profile fields in sync on every login
        await supabase
          .from("profiles")
          .update({
            email: user.email,
            full_name:
              (user.user_metadata as Record<string, unknown>)?.full_name ??
              (user.user_metadata as Record<string, unknown>)?.name ??
              null,
            avatar_url:
              (user.user_metadata as Record<string, unknown>)?.avatar_url ??
              null,
          })
          .eq("id", user.id);
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`);
}
