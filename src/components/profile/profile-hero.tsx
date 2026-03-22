"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function initialsFrom(name: string, email: string) {
  const n = name.trim();
  if (n.length > 0) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase();
}

export type ProfileHeroProps = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  heroLine?: string;
  className?: string;
};

export function ProfileHero({ displayName, email, avatarUrl, heroLine, className }: ProfileHeroProps) {
  const t = useTranslations("dashboard");
  const safeName = displayName.trim() || email.split("@")[0] || "User";
  const initials = initialsFrom(displayName, email);
  const showImage = Boolean(avatarUrl && avatarUrl.length > 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-blue-500/[0.05]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
        <div className="flex shrink-0 justify-center sm:justify-start">
          <div
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-2xl font-semibold tracking-tight text-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-card sm:h-28 sm:w-28 sm:text-3xl"
            aria-hidden
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-provided OAuth / storage URLs
              <img src={avatarUrl!} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{safeName}</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
          {heroLine ? (
            <p className="mt-3 text-sm text-muted-foreground/90">{heroLine}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground/90">{t("heroDefaultTagline")}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
