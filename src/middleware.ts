import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const protectedRoutes = ["/dashboard", "/settings", "/wrong-answers"];

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const { user } = await updateSession(request, intlResponse);

  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|zh|ja|ko)/, "");

  const isProtected = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtected && !user) {
    const locale = pathname.split("/")[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/(en|zh|ja|ko)/:path*"],
};
