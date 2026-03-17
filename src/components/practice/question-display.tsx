"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { Question, QuestionOption } from "@/lib/data/questions";

type QuestionDisplayProps = {
  question: Question;
  questionIndex: number;
  totalCount: number;
  selectedIds: string[];
  onSelect: (optionId: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  correctOptionIds: string[];
  explanation: string;
  isLocked?: boolean;
  isReviewMode?: boolean;
};

export function QuestionDisplay({
  question,
  questionIndex,
  totalCount,
  selectedIds,
  onSelect,
  isSubmitted,
  isCorrect,
  correctOptionIds,
  explanation,
  isLocked = false,
  isReviewMode = false,
}: QuestionDisplayProps) {
  const t = useTranslations("practice.quiz");

  const getOptionStyle = (opt: QuestionOption) => {
    const selected = selectedIds.includes(opt.id);
    const isCorrectOpt = correctOptionIds.includes(opt.id);

    if (!isSubmitted) {
      return cn(
        "cursor-pointer transition-colors",
        selected && "border-primary bg-primary/5"
      );
    }
    if (isCorrectOpt) {
      return "border-green-500 bg-green-50 dark:bg-green-950/30 cursor-default";
    }
    if (selected && !isCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-950/30 cursor-default";
    }
    return "cursor-default opacity-70";
  };

  return (
    <div className="space-y-6">
      <p className="text-sm font-medium">
        <span className="text-primary">{question.category_name}</span>
        <span className="text-muted-foreground">
          {" · "}
          {t("questionN", { n: questionIndex + 1, total: totalCount })}
        </span>
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-lg font-medium text-foreground">{question.question_text}</p>
      </div>

      {isLocked ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-muted-foreground">
          {t("locked")}
        </div>
      ) : (
        <ul className="space-y-2">
          {question.options.map((opt) => {
            const selected = selectedIds.includes(opt.id);
            const isCorrectOpt = correctOptionIds.includes(opt.id);

            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.id)}
                  disabled={isSubmitted || isLocked || isReviewMode}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                    "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected && !isSubmitted && "border-primary bg-primary/5",
                    getOptionStyle(opt)
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                    {opt.option_label}
                  </span>
                  <span className="flex-1">{opt.option_text}</span>
                  {isSubmitted && isCorrectOpt && (
                    <motion.span
                      className="text-green-600 dark:text-green-400"
                      aria-hidden
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {isSubmitted && selected && !isCorrect && !isCorrectOpt && (
                    <motion.span
                      className="text-red-600 dark:text-red-400"
                      aria-hidden
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      ✗
                    </motion.span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isSubmitted && explanation && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-primary">{t("explanation")}</p>
          <MarkdownContent
            content={explanation}
            className="mt-2 text-sm text-foreground/90 prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0"
          />
        </div>
      )}
    </div>
  );
}
