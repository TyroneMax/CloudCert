"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CertificationCard } from "@/components/certifications/certification-card";
import type { CertificationWithProgress } from "@/lib/data/certifications";

const PROVIDERS = ["all", "AWS", "Azure", "GCP"] as const;

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
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {PROVIDERS.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentProvider === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(`filter${p === "all" ? "All" : p}`)}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          certs.map((cert, i) => <CertificationCard key={cert.id} certification={cert} index={i} />)
        )}
      </div>
    </div>
  );
}
