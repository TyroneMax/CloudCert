"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { CertificationWithProgress } from "@/lib/data/certifications";

const providerColors: Record<string, string> = {
  AWS: "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30",
  Azure: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30",
  GCP: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
};

const providerIcons: Record<string, string> = {
  AWS: "🟧",
  Azure: "🔵",
  GCP: "🔴",
};

type CertificationCardProps = {
  certification: CertificationWithProgress;
  index?: number;
};

export function CertificationCard({ certification, index = 0 }: CertificationCardProps) {
  const t = useTranslations("certifications");
  const locale = useLocale();
  const colorClass = providerColors[certification.provider] ?? "border-border bg-muted/30";
  const icon = providerIcons[certification.provider] ?? "📜";
  const progressPercent =
    certification.total_questions > 0
      ? Math.round((certification.answered_count / certification.total_questions) * 100)
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/${locale}/practice/${certification.code}`}
        className={`block rounded-xl border p-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${colorClass}`}
      >
        <div className="flex items-start justify-between">
          <div className="text-4xl">{icon}</div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
            {t("available")}
          </span>
        </div>

        <h3 className="mt-4 text-xl font-semibold text-foreground">
          {certification.name_translated ?? certification.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{certification.provider}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{certification.total_questions} {t("questions")}</span>
          <span>{certification.free_question_limit} {t("freeQuestions")}</span>
        </div>

        {certification.answered_count > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("progress")}</span>
              <span>
                {certification.answered_count} / {certification.total_questions}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
          {t("startPractice")}
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.article>
  );
}
