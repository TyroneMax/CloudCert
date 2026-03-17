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

const GRID_SIZE = 10;

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
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${Math.min(GRID_SIZE, indices.length)}, minmax(0, 1fr))`,
      }}
    >
      {indices.map((globalIdx, localIdx) => {
        const status = questionStatuses[globalIdx] ?? "unanswered";
        const isCurrent = globalIdx === currentIndex;

        return (
          <motion.button
            key={globalIdx}
            type="button"
            onClick={() => onQuestionClick(globalIdx)}
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
                ? t("lockedAria", { n: localIdx })
                : t("questionAria", { n: localIdx, status })
            }
            initial={false}
            animate={{
              scale: isCurrent ? 1.05 : 1,
              transition: { type: "spring", stiffness: 300, damping: 24 },
            }}
          >
            {status === "locked" ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              localIdx
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
      className="flex flex-col rounded-xl border bg-card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 text-sm">
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
          {t("total")} {questions.length}
        </span>
      </div>

      <div className="max-h-[400px] min-h-0 overflow-y-auto">
        <div className="space-y-4">
          {singleChoiceIndices.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
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
              <p className="mb-2 text-xs font-medium text-muted-foreground">
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

      <div className="mt-4 flex shrink-0 flex-wrap gap-2 text-xs text-muted-foreground">
        <span>✓ {t("legendCorrect")}</span>
        <span>✗ {t("legendWrong")}</span>
        <span>○ {t("legendUnanswered")}</span>
        <span>🔒 {t("legendLocked")}</span>
      </div>
    </motion.div>
  );
}
