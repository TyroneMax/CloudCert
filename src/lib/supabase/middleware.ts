import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Cookie max 400 days per browser spec (RFC 6265bis)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            const cookieOptions = {
              path: options?.path ?? "/",
              maxAge: options?.maxAge ?? COOKIE_MAX_AGE,
              sameSite: (options?.sameSite ?? "lax") as "lax" | "strict" | "none",
              secure: options?.secure ?? process.env.NODE_ENV === "production",
            };
            response.cookies.set(name, value, cookieOptions);
          });
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}
