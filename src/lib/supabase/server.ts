import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cookie max 400 days per browser spec (RFC 6265bis)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                path: options?.path ?? "/",
                maxAge: options?.maxAge ?? COOKIE_MAX_AGE,
                sameSite: options?.sameSite ?? "lax",
                secure: options?.secure ?? process.env.NODE_ENV === "production",
              })
            );
          } catch {
            // setAll can be called from Server Component where cookies are read-only.
          }
        },
      },
      cookieOptions: {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
