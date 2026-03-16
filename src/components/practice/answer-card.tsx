"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export type QuestionStatus = "correct" | "wrong" | "current" | "unanswered" | "locked";

type AnswerCardProps = {
  totalCount: number;
  currentIndex: number;
  questionStatuses: QuestionStatus[];
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  onQuestionClick: (index: number) => void;
};

const GRID_SIZE = 10;

export function AnswerCard({
  totalCount,
  currentIndex,
  questionStatuses,
  correctCount,
  wrongCount,
  unansweredCount,
  onQuestionClick,
}: AnswerCardProps) {
  const t = useTranslations("practice.quiz");

  return (
    <div className="flex flex-col rounded-xl border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <span aria-hidden>✓</span>
          {correctCount}
        </span>
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <span aria-hidden>✗</span>
          {wrongCount}
        </span>
        <span className="text-muted-foreground">
          {t("unanswered")} {unansweredCount}
        </span>
        <span className="text-muted-foreground">
          {t("total")} {totalCount}
        </span>
      </div>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(GRID_SIZE, totalCount)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: totalCount }, (_, i) => {
          const status = questionStatuses[i] ?? "unanswered";
          const isCurrent = i === currentIndex;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onQuestionClick(i)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                status === "correct" &&
                  "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
                status === "wrong" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
                status === "current" &&
                  "border-2 border-primary bg-primary/10 text-primary",
                status === "unanswered" &&
                  "border border-border bg-muted/30 text-muted-foreground hover:bg-muted",
                status === "locked" &&
                  "border border-border bg-muted/50 text-muted-foreground"
              )}
              aria-label={
                status === "locked"
                  ? t("lockedAria", { n: i + 1 })
                  : t("questionAria", { n: i + 1, status })
              }
            >
              {status === "locked" ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>✓ {t("legendCorrect")}</span>
        <span>✗ {t("legendWrong")}</span>
        <span>○ {t("legendUnanswered")}</span>
        <span>🔒 {t("legendLocked")}</span>
      </div>
    </div>
  );
}
