"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const VALID_PLANS = ["thanks", "support", "sponsor"] as const;
type PlanType = (typeof VALID_PLANS)[number];

const planConfig: Record<PlanType, { priceKey: string; descKey: string; featKey: string }> = {
  thanks: { priceKey: "thanksPrice", descKey: "thanksDesc", featKey: "feat_twoBanks" },
  support: { priceKey: "supportPrice", descKey: "supportDesc", featKey: "feat_threeBanks" },
  sponsor: { priceKey: "sponsorPrice", descKey: "sponsorDesc", featKey: "feat_allBanks" },
};

export default function DonatePage() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") as PlanType | null;
  const plan = planParam && VALID_PLANS.includes(planParam) ? planParam : "thanks";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        const redirect = `/${locale}/donate${planParam ? `?plan=${planParam}` : ""}`;
        window.location.href = `/${locale}/auth/login?redirect=${encodeURIComponent(redirect)}`;
      }
    });
  }, [locale, planParam]);

  const config = planConfig[plan];

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("pricingTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("pricingSubtitle")}</p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold">
          {plan === "thanks" && t("tierThanks")}
          {plan === "support" && t("tierSupport")}
          {plan === "sponsor" && t("tierSponsor")}
        </h2>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{t(config.priceKey)}</span>
          <span className="text-sm text-muted-foreground">/{t("donationOnce")}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t(config.descKey)}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 shrink-0 text-green-600" />
          {t(config.featKey)}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg">
            {t("donateProceed")}
          </Button>
          <Button size="lg" variant="outline" render={<Link href={`/${locale}/certifications`} />}>
            {t("ctaView")}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-muted-foreground">选择其他档位</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {VALID_PLANS.map((p) => (
            <Button
              key={p}
              variant={p === plan ? "default" : "outline"}
              className="w-full"
              render={<Link href={`/${locale}/donate?plan=${p}`} />}
            >
              {p === "thanks" && t("tierThanks")}
              {p === "support" && t("tierSupport")}
              {p === "sponsor" && t("tierSponsor")}
              {" — "}
              {t(planConfig[p].priceKey)}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
