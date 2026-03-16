import { createBrowserClient } from "@supabase/ssr";

// Cookie max 400 days per browser spec (RFC 6265bis)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
