"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Target, TrendingUp, AlertCircle } from "lucide-react";

const rateColor = (rate: number) => {
  if (rate >= 70) return "text-green-600 dark:text-green-400";
  if (rate >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const providerProgressBar: Record<string, string> = {
  AWS: "bg-gradient-to-r from-orange-400 to-amber-500",
  Azure: "bg-gradient-to-r from-sky-400 to-blue-600",
  GCP: "bg-gradient-to-r from-blue-400 to-indigo-500",
};

type StatsOverviewProps = {
  answeredCount: number;
  totalCount: number;
  correctRate: number;
  wrongCount: number;
  certCode: string;
  provider?: string;
};

export function StatsOverview({
  answeredCount,
  totalCount,
  correctRate,
  wrongCount,
  certCode,
  provider = "AWS",
}: StatsOverviewProps) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const progressBarClass = providerProgressBar[provider] ?? "bg-primary";

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4.5 w-4.5 text-primary" aria-hidden />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{t("statsProgress")}</p>
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums">
          {answeredCount} <span className="text-base font-normal text-muted-foreground">/ {totalCount}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${progressBarClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">{progressPercent}%</p>
      </motion.div>

      {/* Correct Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/15">
            <TrendingUp className="h-4.5 w-4.5 text-green-600 dark:text-green-400" aria-hidden />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{t("statsCorrectRate")}</p>
        </div>
        <p className={`mt-3 text-2xl font-bold tabular-nums ${rateColor(correctRate)}`}>
          {correctRate.toFixed(1)}%
        </p>
      </motion.div>

      {/* Wrong Answers Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 dark:bg-red-500/15">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" aria-hidden />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{t("statsWrong")}</p>
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums">{wrongCount}</p>
        {wrongCount > 0 && (
          <Link
            href={`/${locale}/wrong-answers?cert=${certCode}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("reviewWrong")}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
