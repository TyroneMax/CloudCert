"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PricingSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  const tiers = [
    {
      key: "free" as const,
      name: t("freePlan"),
      price: t("freePrice"),
      period: t("freePeriod"),
      description: t("freeDesc"),
      feature: t("feat_oneBank"),
      cta: t("startFree"),
      highlighted: false,
      planType: null as string | null,
    },
    {
      key: "thanks" as const,
      name: t("tierThanks"),
      price: t("thanksPrice"),
      period: t("donationOnce"),
      description: t("thanksDesc"),
      feature: t("feat_twoBanks"),
      cta: t("donate"),
      highlighted: false,
      planType: "thanks",
    },
    {
      key: "support" as const,
      name: t("tierSupport"),
      price: t("supportPrice"),
      period: t("donationOnce"),
      description: t("supportDesc"),
      feature: t("feat_threeBanks"),
      cta: t("donate"),
      highlighted: true,
      badge: t("mostPopular"),
      planType: "support",
    },
    {
      key: "sponsor" as const,
      name: t("tierSponsor"),
      price: t("sponsorPrice"),
      period: t("donationOnce"),
      description: t("sponsorDesc"),
      feature: t("feat_allBanks"),
      cta: t("donate"),
      highlighted: false,
      planType: "sponsor",
    },
  ];

  return (
    <section id="pricing" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("pricingTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("pricingSubtitle")}</p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 ${
                  tier.highlighted ? "border-blue-300 bg-card shadow-lg ring-1 ring-blue-200" : "border-border/60 bg-card"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {tier.badge}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">/{tier.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  {tier.feature}
                </div>
                <div className="mt-6 flex-1">
                  {tier.planType ? (
                    <Button size="lg" className="w-full" variant={tier.highlighted ? "default" : "outline"} disabled>
                      {t("donateComingSoon")}
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full" variant="outline" render={<Link href={`/${locale}/auth/register`} />}>
                      {tier.cta}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          {t("pricingNote")}
        </motion.p>
      </div>
    </section>
  );
}
