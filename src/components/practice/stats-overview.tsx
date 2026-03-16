"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type StatsOverviewProps = {
  answeredCount: number;
  totalCount: number;
  correctRate: number;
  wrongCount: number;
  certCode: string;
};

export function StatsOverview({
  answeredCount,
  totalCount,
  correctRate,
  wrongCount,
  certCode,
}: StatsOverviewProps) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">{t("statsProgress")}</p>
        <p className="mt-1 text-2xl font-bold">
          {answeredCount} / {totalCount}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">{t("statsCorrectRate")}</p>
        <p className="mt-1 text-2xl font-bold">{correctRate.toFixed(1)}%</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">{t("statsWrong")}</p>
        <p className="mt-1 text-2xl font-bold">{wrongCount}</p>
        {wrongCount > 0 && (
          <Link
            href={`/${locale}/wrong-answers?cert=${certCode}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("reviewWrong")}
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
