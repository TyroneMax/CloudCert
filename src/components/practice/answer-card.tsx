"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import type { Question } from "@/lib/data/questions";

export type QuestionStatus = "correct" | "wrong" | "current" | "unanswered" | "locked";

type AnswerCardProps = {
  questions: Question[];
  currentIndex: number;
  questionStatuses: QuestionStatus[];
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  onQuestionClick: (index: number) => void;
};

const COLS_CLASS = "grid-cols-5 sm:grid-cols-6";

function QuestionGrid({
  indices,
  questionStatuses,
  currentIndex,
  onQuestionClick,
  t,
}: {
  indices: number[];
  questionStatuses: QuestionStatus[];
  currentIndex: number;
  onQuestionClick: (index: number) => void;
  t: (key: string, values?: Record<string, number | string>) => string;
}) {
  return (
    <div className={cn("grid gap-2", COLS_CLASS)}>
      {indices.map((globalIdx, localIdx) => {
        const answered = questionStatuses[globalIdx] ?? "unanswered";
        const isCurrent = globalIdx === currentIndex;
        const displayNum = localIdx + 1;

        return (
          <motion.button
            key={globalIdx}
            type="button"
            onClick={() => onQuestionClick(globalIdx)}
            className={cn(
              "flex aspect-square min-h-9 min-w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              answered === "correct" &&
                "bg-emerald-500 text-white shadow-sm dark:bg-emerald-600 dark:text-white",
              answered === "wrong" &&
                "bg-rose-500 text-white shadow-sm dark:bg-rose-600 dark:text-white",
              answered === "unanswered" &&
                "border border-border bg-muted/40 text-muted-foreground hover:bg-muted",
              answered === "locked" &&
                "border border-border bg-muted/60 text-muted-foreground",
              isCurrent &&
                "ring-2 ring-primary ring-offset-2 ring-offset-card dark:ring-offset-card"
            )}
            aria-label={
              answered === "locked"
                ? t("lockedAria", { n: displayNum })
                : t("questionAria", {
                    n: displayNum,
                    status:
                      answered === "correct"
                        ? t("answerStatus.correct")
                        : answered === "wrong"
                          ? t("answerStatus.wrong")
                          : t("answerStatus.unanswered"),
                  })
            }
            aria-current={isCurrent ? "true" : undefined}
            initial={false}
            animate={{
              scale: isCurrent ? 1.04 : 1,
              transition: { type: "spring", stiffness: 320, damping: 22 },
            }}
          >
            {answered === "locked" ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              displayNum
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function AnswerCard({
  questions,
  currentIndex,
  questionStatuses,
  correctCount,
  wrongCount,
  unansweredCount,
  onQuestionClick,
}: AnswerCardProps) {
  const t = useTranslations("practice.quiz");

  const singleChoiceIndices = questions
    .map((q, i) => (q.question_type === "single_choice" ? i : -1))
    .filter((i) => i >= 0);
  const multipleChoiceIndices = questions
    .map((q, i) => (q.question_type === "multiple_choice" ? i : -1))
    .filter((i) => i >= 0);

  return (
    <motion.div
      className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
            <span aria-hidden>✓</span>
            {correctCount}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 font-medium text-rose-700 dark:text-rose-400">
            <span aria-hidden>✗</span>
            {wrongCount}
          </span>
          <span className="text-muted-foreground">
            {t("unanswered")} {unansweredCount}
          </span>
          <span className="text-muted-foreground">
            · {t("total")} {questions.length}
          </span>
        </div>
      </div>

      <div className="max-h-[min(420px,55vh)] min-h-0 overflow-y-auto px-4 py-4">
        <div className="space-y-6">
          {singleChoiceIndices.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("singleChoice")}
              </p>
              <QuestionGrid
                indices={singleChoiceIndices}
                questionStatuses={questionStatuses}
                currentIndex={currentIndex}
                onQuestionClick={onQuestionClick}
                t={t}
              />
            </div>
          )}
          {multipleChoiceIndices.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("multipleChoice")}
              </p>
              <QuestionGrid
                indices={multipleChoiceIndices}
                questionStatuses={questionStatuses}
                currentIndex={currentIndex}
                onQuestionClick={onQuestionClick}
                t={t}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 bg-muted/15 px-4 py-2.5">
        <p className="text-xs leading-relaxed text-muted-foreground">{t("answerCardTip")}</p>
      </div>
    </motion.div>
  );
}
