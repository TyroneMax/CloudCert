"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { BookOpen, RotateCcw, ClipboardList, LayoutDashboard, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHero } from "@/components/profile/profile-hero";
import { UserPreferencesForm } from "@/components/profile/user-preferences-form";
import type { DashboardData } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "account";

type DashboardClientProps = {
  data: DashboardData;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  locale: string;
  initialTab: DashboardTab;
  uiLanguage: string;
  questionLanguage: string;
  practiceAutoNextOnCorrect: boolean;
  practiceRevealImmediate: boolean;
  practiceAlwaysShowExplanation: boolean;
  practiceAutoSubmit: boolean;
};

function DashboardOverview({
  data,
  displayName,
  locale,
}: {
  data: DashboardData;
  displayName: string;
  locale: string;
}) {
  const t = useTranslations("dashboard");
  const { stats, certProgress, categoryBreakdown, recentActivity } = data;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-foreground/90 sm:text-xl">{t("welcome", { name: displayName })}</h2>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border/80 bg-card p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">{t("totalAnswered")}</p>
          <p className="mt-2 text-3xl font-bold">{stats.totalAnswered}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-border/80 bg-card p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">{t("correctRate")}</p>
          <p className="mt-2 text-3xl font-bold">{stats.correctRate}%</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-border/80 bg-card p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-muted-foreground">{t("wrongAnswers")}</p>
          <p className="mt-2 text-3xl font-bold">
            {stats.wrongCount > 0 ? (
              <Link
                href={`/${locale}/wrong-answers`}
                className="text-primary hover:underline"
              >
                {stats.wrongCount}
              </Link>
            ) : (
              stats.wrongCount
            )}
          </p>
        </motion.div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("myCertifications")}</h2>
        <div className="mt-4 space-y-4">
          {certProgress.map((cert, i) => {
            const hasProgress = cert.answered_count > 0;
            const progressPercent =
              cert.total_questions > 0
                ? Math.round((cert.answered_count / cert.total_questions) * 100)
                : 0;

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                className="rounded-xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🟧</span>
                    <div>
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cert.answered_count} / {cert.total_questions} · {cert.correct_rate}%
                      </p>
                    </div>
                  </div>
                </div>

                {hasProgress && (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" render={<Link href={`/${locale}/certifications/${cert.code}?start=${hasProgress ? cert.answered_count + 1 : 1}`} />}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {hasProgress ? t("continuePractice") : t("startPractice")}
                  </Button>
                  {hasProgress && cert.wrong_count > 0 && (
                    <Button size="sm" variant="outline" render={<Link href={`/${locale}/wrong-answers?cert=${cert.code}`} />}>
                      {t("viewWrongAnswers")}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {categoryBreakdown.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">{t("categoryBreakdown")}</h2>
          <div className="mt-4 space-y-3">
            {categoryBreakdown.map((cat) => {
              const color =
                cat.rate >= 80
                  ? "bg-green-500"
                  : cat.rate >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500";
              return (
                <div key={cat.name} className="flex items-center gap-4">
                  <span className="w-28 shrink-0 text-sm font-medium">{cat.name}</span>
                  <div className="min-w-0 flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${cat.rate}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm text-muted-foreground">
                    {cat.rate}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {recentActivity.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">{t("recentActivity")}</h2>
          <ul className="mt-4 space-y-2">
            {recentActivity.map((a) => (
              <li key={`${a.date}-${a.cert_name}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{a.date}</span>
                <span>·</span>
                <span>{t("answeredN", { count: a.question_count })} ({a.cert_name})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">{t("quickActions")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" render={<Link href={`/${locale}/certifications`} />}>
            <ClipboardList className="mr-2 h-4 w-4" />
            {t("browseCerts")}
          </Button>
          <Button variant="outline" render={<Link href={`/${locale}/wrong-answers`} />}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reviewWrong")}
          </Button>
        </div>
      </section>
    </div>
  );
}

export function DashboardClient({
  data,
  displayName,
  email,
  avatarUrl,
  locale,
  initialTab,
  uiLanguage,
  questionLanguage,
  practiceAutoNextOnCorrect,
  practiceRevealImmediate,
  practiceAlwaysShowExplanation,
  practiceAutoSubmit,
}: DashboardClientProps) {
  const t = useTranslations("dashboard");
  const [tab, setTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const heroLine =
    data.stats.totalAnswered > 0
      ? t("heroStatsLine", { count: data.stats.totalAnswered, rate: data.stats.correctRate })
      : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ProfileHero
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
        heroLine={heroLine}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label={t("tabsAria")}
          className="inline-flex gap-1 rounded-xl border border-border/80 bg-muted/40 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "overview"}
            id="dashboard-tab-overview"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === "overview"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("overview")}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 opacity-70" />
            {t("tabOverview")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "account"}
            id="dashboard-tab-account"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === "account"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("account")}
          >
            <UserRound className="h-4 w-4 shrink-0 opacity-70" />
            {t("tabAccount")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right">{t("fullSettingsHint")}</p>
      </div>

      <div
        role="tabpanel"
        aria-labelledby={tab === "overview" ? "dashboard-tab-overview" : "dashboard-tab-account"}
        className="min-h-[320px]"
      >
        {tab === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <DashboardOverview data={data} displayName={displayName} locale={locale} />
          </motion.div>
        ) : (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <UserPreferencesForm
              displayName={displayName}
              email={email}
              uiLanguage={uiLanguage}
              questionLanguage={questionLanguage}
              locale={locale}
              practiceAutoNextOnCorrect={practiceAutoNextOnCorrect}
              practiceRevealImmediate={practiceRevealImmediate}
              practiceAlwaysShowExplanation={practiceAlwaysShowExplanation}
              practiceAutoSubmit={practiceAutoSubmit}
              afterLocaleChange="dashboard"
              localeRedirectSuffix="?tab=account"
            />
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link href={`/${locale}/settings`} className="font-medium text-primary hover:underline">
                {t("openFullSettings")}
              </Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
