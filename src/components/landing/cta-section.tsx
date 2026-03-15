"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-16 text-center text-white shadow-xl sm:px-16 lg:py-24"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">{t("ctaSubtitle")}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 bg-white text-blue-700 hover:bg-blue-50" render={<Link href={`/${locale}/auth/register`} />}>
                {t("ctaButton")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-6 text-sm text-blue-200">{t("ctaNote")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
