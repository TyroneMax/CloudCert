"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Map, Check, Circle, ArrowRight } from "lucide-react";

const PHASE1_ITEMS = [
  "AWS Certification Question Bank",
  "Web Application",
  "Google + Email Authentication",
  "Multi-language Support",
  "Question Explanations",
  "Wrong Answer Review",
];

const PHASE2_ITEMS = [
  "Exam Simulation Mode",
  "Bookmark / Favorites",
  "Dark Mode",
  "Spaced Repetition",
  "More AWS Certifications",
];

const PHASE3_ITEMS = [
  "Azure & GCP Question Banks",
  "iOS Mobile App",
  "AI-Powered Explanations",
  "Community Features",
];

export function RoadmapSection() {
  const t = useTranslations("roadmap");
  const tLanding = useTranslations("landing");
  const locale = useLocale();

  return (
    <section id="roadmap" className="scroll-mt-20 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border/60 bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{t("phase1")}</h3>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
                {t("statusInProgress")}
              </span>
            </div>
            <ul className="space-y-2">
              {PHASE1_ITEMS.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{t("phase2")}</h3>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
                {t("statusPlanned")}
              </span>
            </div>
            <ul className="space-y-2">
              {PHASE2_ITEMS.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-border/60 bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{t("phase3")}</h3>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                {t("statusFuture")}
              </span>
            </div>
            <ul className="space-y-2">
              {PHASE3_ITEMS.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href={`/${locale}/roadmap`}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Map className="h-4 w-4" />
            {tLanding("roadmapViewFull")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
