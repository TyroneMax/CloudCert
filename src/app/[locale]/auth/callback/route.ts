import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LOCALES = ["en", "zh", "ja", "ko"] as const;

export async function GET(request: Request) {
  const { searchParams, origin, pathname } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const locale = LOCALES.find((l) => pathname.startsWith(`/${l}/`)) ?? "en";
  const defaultNext = `/${locale}/dashboard`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next && next.startsWith("/") ? next : defaultNext;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/login?error=auth_callback_error`);
}
