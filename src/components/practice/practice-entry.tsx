"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowLeft, Play, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CloudProviderLogos } from "@/components/icons/cloud-provider-logos";
import { StatsOverview } from "./stats-overview";
import { CategoryList } from "./category-list";
import type { PracticeEntryData } from "@/lib/data/practice";

const providerAccent: Record<string, { gradient: string; logoBg: string; bar: string }> = {
  AWS: {
    gradient: "from-orange-500/8 via-amber-500/4 to-transparent",
    logoBg: "bg-orange-50 dark:bg-orange-950/40",
    bar: "from-orange-400 to-amber-500",
  },
  Azure: {
    gradient: "from-sky-500/8 via-blue-500/4 to-transparent",
    logoBg: "bg-sky-50 dark:bg-sky-950/40",
    bar: "from-sky-400 to-blue-600",
  },
  GCP: {
    gradient: "from-blue-500/8 via-indigo-500/4 to-transparent",
    logoBg: "bg-blue-50 dark:bg-blue-950/40",
    bar: "from-blue-400 to-indigo-500",
  },
};

const defaultAccent = {
  gradient: "from-primary/5 via-primary/[0.02] to-transparent",
  logoBg: "bg-muted",
  bar: "from-gray-400 to-gray-500",
};

type PracticeEntryProps = {
  data: PracticeEntryData;
};

export function PracticeEntry({ data }: PracticeEntryProps) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const { certification, stats, last_question_sort_order, categories } = data;

  const nextQuestion = (last_question_sort_order ?? 0) + 1;
  const hasProgress = stats.answered_count > 0;
  const accent = providerAccent[certification.provider] ?? defaultAccent;
  const Logo = CloudProviderLogos[certification.provider as keyof typeof CloudProviderLogos];

  return (
    <div>
      {/* Hero Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <Link
            href={`/${locale}/certifications`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mt-6 flex items-start gap-5"
          >
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${accent.logoBg} p-2.5 shadow-sm`}>
              {Logo ? <Logo size={44} /> : <span className="text-3xl">📜</span>}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {certification.name}
              </h1>
              <p className="mt-1 text-base text-muted-foreground">{certification.provider}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <StatsOverview
              answeredCount={stats.answered_count}
              totalCount={certification.total_questions}
              correctRate={stats.correct_rate}
              wrongCount={stats.wrong_count}
              certCode={certification.code}
              provider={certification.provider}
            />
          </motion.div>

          {/* Practice Mode */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{t("practiceMode")}</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {hasProgress && (
                <Button
                  size="lg"
                  render={
                    <Link
                      href={`/${locale}/certifications/${certification.code}?start=${nextQuestion}`}
                    />
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t("continueFrom", { n: nextQuestion })}
                </Button>
              )}
              <Button
                variant={hasProgress ? "outline" : "default"}
                size="lg"
                render={
                  <Link href={`/${locale}/certifications/${certification.code}?start=1`} />
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("startFrom")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                render={
                  <Link
                    href={`/${locale}/certifications/${certification.code}?start=1&mode=memorization`}
                  />
                }
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t("memorizationMode")}
              </Button>
            </div>
          </motion.section>

          {/* Category List */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <CategoryList
              categories={categories}
              certCode={certification.code}
              provider={certification.provider}
            />
          </motion.section>
        </div>
      </div>
    </div>
  );
}
