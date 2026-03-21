"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ChevronRight, BookOpen, Gift, Check } from "lucide-react";
import { CloudProviderLogos } from "@/components/icons/cloud-provider-logos";
import type { CertificationWithProgress } from "@/lib/data/certifications";

const providerAccent: Record<string, { card: string; bar: string; logoBg: string; progressBar: string }> = {
  AWS: {
    card: "border-orange-200/70 hover:border-orange-300 dark:border-orange-800/40 dark:hover:border-orange-700/60",
    bar: "from-orange-400 to-amber-500",
    logoBg: "bg-orange-50 dark:bg-orange-950/40",
    progressBar: "bg-gradient-to-r from-orange-400 to-amber-500",
  },
  Azure: {
    card: "border-sky-200/70 hover:border-sky-300 dark:border-sky-800/40 dark:hover:border-sky-700/60",
    bar: "from-sky-400 to-blue-600",
    logoBg: "bg-sky-50 dark:bg-sky-950/40",
    progressBar: "bg-gradient-to-r from-sky-400 to-blue-600",
  },
  GCP: {
    card: "border-blue-200/70 hover:border-blue-300 dark:border-blue-800/40 dark:hover:border-blue-700/60",
    bar: "from-blue-400 to-indigo-500",
    logoBg: "bg-blue-50 dark:bg-blue-950/40",
    progressBar: "bg-gradient-to-r from-blue-400 to-indigo-500",
  },
};

const defaultAccent = {
  card: "border-border hover:border-border",
  bar: "from-gray-400 to-gray-500",
  logoBg: "bg-muted",
  progressBar: "bg-primary",
};

type CertificationCardProps = {
  certification: CertificationWithProgress;
  index?: number;
};

export function CertificationCard({ certification, index = 0 }: CertificationCardProps) {
  const t = useTranslations("certifications");
  const locale = useLocale();
  const accent = providerAccent[certification.provider] ?? defaultAccent;
  const progressPercent =
    certification.total_questions > 0
      ? Math.round((certification.answered_count / certification.total_questions) * 100)
      : 0;

  const Logo = CloudProviderLogos[certification.provider as keyof typeof CloudProviderLogos];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.06 }}
      className="group"
    >
      <Link
        href={`/${locale}/certifications/${certification.code}`}
        className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${accent.card}`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${accent.logoBg} p-2`}>
              {Logo ? <Logo size={36} /> : <span className="text-2xl">📜</span>}
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <Check className="h-3.5 w-3.5" aria-hidden />
              {t("available")}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground">
            {certification.name_translated ?? certification.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{certification.provider}</p>

          {certification.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
              {certification.description}
            </p>
          )}

          <div className="mt-auto pt-5">
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                {certification.total_questions} {t("questions")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Gift className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                {certification.free_question_limit} {t("freeQuestions")}
              </span>
            </div>

            {certification.answered_count > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("progress")}</span>
                  <span className="font-medium tabular-nums">
                    {certification.answered_count}/{certification.total_questions} ({progressPercent}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${accent.progressBar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 + 0.3 }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors">
              {t("startPractice")}
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
