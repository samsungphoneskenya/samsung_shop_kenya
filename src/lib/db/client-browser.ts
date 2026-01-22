import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components
 * Should ONLY be used for:
 * - Auth UI components (sign in/sign up forms)
 * - Real-time subscriptions
 * - Client-side auth state
 *
 * NEVER use for direct database queries from the browser
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
