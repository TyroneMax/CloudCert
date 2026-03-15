"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function PricingSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  const plans = [
    {
      name: t("freePlan"),
      price: t("freePrice"),
      period: t("freePeriod"),
      description: t("freeDesc"),
      features: [
        { text: t("feat_freeQuestions"), included: true },
        { text: t("feat_explanations"), included: true },
        { text: t("feat_wrongNotebook"), included: true },
        { text: t("feat_progress"), included: true },
        { text: t("feat_fullAccess"), included: false },
      ],
      cta: t("startFree"),
      highlighted: false,
    },
    {
      name: t("proPlan"),
      price: t("proPrice"),
      period: t("proPeriod"),
      description: t("proDesc"),
      features: [
        { text: t("feat_allQuestions"), included: true },
        { text: t("feat_explanations"), included: true },
        { text: t("feat_wrongNotebook"), included: true },
        { text: t("feat_progress"), included: true },
        { text: t("feat_fullAccess"), included: true },
      ],
      cta: t("getPro"),
      highlighted: true,
      badge: t("mostPopular"),
      yearly: t("proYearly"),
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

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={`relative flex h-full flex-col rounded-2xl border p-8 ${plan.highlighted ? "border-blue-300 bg-card shadow-lg ring-1 ring-blue-200" : "border-border/60 bg-card"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">{plan.badge}</div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.yearly && <p className="mt-1 text-sm font-medium text-blue-600">{plan.yearly}</p>}
                  <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button size="lg" className="w-full" variant={plan.highlighted ? "default" : "outline"} render={<Link href={`/${locale}/auth/register`} />}>
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="mt-8 text-center text-sm text-muted-foreground">
          {t("pricingNote")}
        </motion.p>
      </div>
    </section>
  );
}
