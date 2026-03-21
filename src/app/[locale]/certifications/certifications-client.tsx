"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Search, BookOpen } from "lucide-react";
import { CloudProviderLogos } from "@/components/icons/cloud-provider-logos";
import { CertificationCard } from "@/components/certifications/certification-card";
import type { CertificationWithProgress } from "@/lib/data/certifications";

const PROVIDERS = ["all", "AWS", "Azure", "GCP"] as const;

const providerFilterStyle: Record<string, { active: string; icon: boolean }> = {
  all: { active: "bg-primary text-primary-foreground shadow-sm", icon: false },
  AWS: { active: "bg-orange-50 text-orange-700 ring-1 ring-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-700", icon: true },
  Azure: { active: "bg-sky-50 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-700", icon: true },
  GCP: { active: "bg-blue-50 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-700", icon: true },
};

type CertificationsClientProps = {
  certs: CertificationWithProgress[];
  locale: string;
};

export function CertificationsClient({ certs, locale }: CertificationsClientProps) {
  const t = useTranslations("certifications");
  const searchParams = useSearchParams();
  const currentProvider = (searchParams.get("provider") ?? "all") as string;

  const buildHref = (provider: string) => {
    const params = new URLSearchParams(searchParams);
    if (provider === "all") params.delete("provider");
    else params.set("provider", provider);
    const q = params.toString();
    return `/${locale}/certifications${q ? `?${q}` : ""}`;
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3"
      >
        {PROVIDERS.map((p) => {
          const isActive = currentProvider === p;
          const style = providerFilterStyle[p];
          const ProviderLogo = p !== "all" ? CloudProviderLogos[p as keyof typeof CloudProviderLogos] : null;

          return (
            <Link
              key={p}
              href={buildHref(p)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? style.active
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {ProviderLogo && <ProviderLogo size={16} />}
              {t(`filter${p === "all" ? "All" : p}`)}
            </Link>
          );
        })}
      </motion.div>

      {/* Cards Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
        {certs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/10 px-6 py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-7 w-7 text-muted-foreground/60" aria-hidden />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              {t("empty")}
            </p>
          </motion.div>
        ) : (
          certs.map((cert, i) => (
            <CertificationCard key={cert.id} certification={cert} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
