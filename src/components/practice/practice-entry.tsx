"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsOverview } from "./stats-overview";
import { CategoryList } from "./category-list";
import type { PracticeEntryData } from "@/lib/data/practice";

type PracticeEntryProps = {
  data: PracticeEntryData;
};

export function PracticeEntry({ data }: PracticeEntryProps) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const { certification, stats, last_question_sort_order, categories } = data;

  const nextQuestion = (last_question_sort_order ?? 0) + 1;
  const hasProgress = stats.answered_count > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={`/${locale}/certifications`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">🟧</span>
          <div>
            <h1 className="text-2xl font-bold">{certification.name}</h1>
            <p className="text-muted-foreground">{certification.provider}</p>
          </div>
        </div>
      </div>

      <StatsOverview
        answeredCount={stats.answered_count}
        totalCount={certification.total_questions}
        correctRate={stats.correct_rate}
        wrongCount={stats.wrong_count}
        certCode={certification.code}
      />

      <section>
        <h2 className="text-lg font-semibold">{t("practiceMode")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {hasProgress && (
            <Button
              size="lg"
              render={
                <Link
                  href={`/${locale}/practice/${certification.code}?start=${nextQuestion}`}
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
              <Link href={`/${locale}/practice/${certification.code}?start=1`} />
            }
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("startFrom")}
          </Button>
        </div>
      </section>

      <section>
        <CategoryList categories={categories} certCode={certification.code} />
      </section>
    </div>
  );
}
