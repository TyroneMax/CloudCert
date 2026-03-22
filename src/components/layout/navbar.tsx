"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X, Cloud, Globe, Check, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { labelKey: "search" as const, path: "/search" },
  { labelKey: "certifications" as const, path: "/certifications" },
  { labelKey: "features" as const, href: "#features" },
  { labelKey: "pricing" as const, href: "#pricing" },
  { labelKey: "roadmap" as const, href: "#roadmap" },
  { labelKey: "faq" as const, href: "#faq" },
];

const localeOptions = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

function userNavInitials(user: User) {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.name === "string"
        ? meta.name
        : typeof meta?.display_name === "string"
          ? meta.display_name
          : "";
  const n = name.trim();
  if (n.length > 0) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const email = user.email ?? "?";
  return email.split("@")[0]?.slice(0, 2).toUpperCase() ?? "?";
}

function userNavAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const u =
    typeof meta?.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta?.picture === "string"
        ? meta.picture
        : "";
  return u.length > 4 ? u : null;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    router.push(`/${locale}`);
    router.refresh();
  };

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = localeOptions.find((o) => o.code === locale)?.label ?? "EN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href={`/${locale}`} className="flex items-center gap-2" aria-label="CloudCert Home">
          <Cloud className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight">CloudCert</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) =>
            "path" in link ? (
              <Link
                key={link.path}
                href={`/${locale}${link.path}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.labelKey)}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.labelKey)}
              </Link>
            )
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Language dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Switch language"
              aria-expanded={langMenuOpen}
            >
              <Globe className="h-4 w-4" />
              {currentLabel}
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-lg border border-border/60 bg-card py-1 shadow-md"
                >
                  {localeOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => switchLocale(opt.code)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {opt.label}
                      {opt.code === locale && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t("userMenu")}
                  aria-expanded={userMenuOpen}
                >
                  {userNavAvatarUrl(user) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URL
                    <img
                      src={userNavAvatarUrl(user)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userNavInitials(user)
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1.5" side="bottom">
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  {t("dashboard")}
                </Link>
                <Link
                  href={`/${locale}/settings`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {t("settings")}
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  {tc("logout")}
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href={`/${locale}/auth/login`} />}>
                {tc("login")}
              </Button>
              <Button size="sm" render={<Link href={`/${locale}/auth/register`} />}>
                {tc("register")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40 bg-background lg:hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-2">
              {navLinks.map((link) =>
                "path" in link ? (
                  <Link
                    key={link.path}
                    href={`/${locale}${link.path}`}
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              )}

              {/* Mobile language options */}
              <div className="border-t border-border/40 pt-2">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Globe className="mr-1 inline h-3.5 w-3.5" />
                  Language
                </p>
                {localeOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => switchLocale(opt.code)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {opt.label}
                    {opt.code === locale && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2 border-t border-border/40 pt-4">
                {user ? (
                  <>
                    <Link href={`/${locale}/dashboard`} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t("dashboard")}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/settings`} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t("settings")}
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      {tc("logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={`/${locale}/auth/login`} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {tc("login")}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/auth/register`} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        {tc("register")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
