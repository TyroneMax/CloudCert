"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionDisplay } from "./question-display";
import { AnswerCard, type QuestionStatus } from "./answer-card";
import type { Question } from "@/lib/data/questions";

type AnswerState = {
  selectedIds: string[];
  isCorrect: boolean | null;
  correctOptionIds: string[];
  explanation: string;
};

type QuizViewProps = {
  certCode: string;
  certName: string;
  questions: Question[];
  startIndex: number;
  mode: "all" | "category";
  backHref?: string;
  backLabel?: string;
};

export function QuizView({
  certCode,
  certName,
  questions,
  startIndex,
  mode,
  backHref,
  backLabel,
}: QuizViewProps) {
  const t = useTranslations("practice.quiz");
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(startIndex - 1, questions.length - 1))
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerCard, setShowAnswerCard] = useState(false);

  const question = questions[currentIndex];
  const answerState = question ? answers.get(question.id) : null;
  const isSubmitted = !!answerState;

  // Sync selectedIds when switching questions
  useEffect(() => {
    if (question) {
      const state = answers.get(question.id);
      setSelectedIds(state?.selectedIds ?? []);
    }
  }, [currentIndex, question?.id, answers]);

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!question) return;
      if (question.question_type === "single_choice") {
        setSelectedIds([optionId]);
      } else {
        setSelectedIds((prev) =>
          prev.includes(optionId)
            ? prev.filter((x) => x !== optionId)
            : [...prev, optionId]
        );
      }
    },
    [question]
  );

  const handleSubmit = useCallback(async () => {
    if (!question || selectedIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedOptionIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");

      setAnswers((prev) =>
        new Map(prev).set(question.id, {
          selectedIds: [...selectedIds],
          isCorrect: data.isCorrect,
          correctOptionIds: data.correctOptionIds ?? [],
          explanation: data.explanation ?? "",
        })
      );
    } catch {
      // TODO: show error toast
    } finally {
      setIsSubmitting(false);
    }
  }, [question, selectedIds, isSubmitting]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      window.location.href = `/${locale}/dashboard`;
      return;
    }
    setSelectedIds([]);
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length, currentIndex, locale]);

  const handleQuestionClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const questionStatuses: QuestionStatus[] = questions.map((q) => {
    const state = answers.get(q.id);
    if (q.is_free === false) return "locked";
    if (!state) return "unanswered";
    return state.isCorrect ? "correct" : "wrong";
  });

  const correctCount = questionStatuses.filter((s) => s === "correct").length;
  const wrongCount = questionStatuses.filter((s) => s === "wrong").length;
  const unansweredCount = questionStatuses.filter((s) => s === "unanswered").length;

  // Update current in statuses for display
  const displayStatuses = questionStatuses.map((s, i) =>
    i === currentIndex ? "current" : s
  );

  const progressPercent =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      {/* Nav bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={backHref ?? `/${locale}/practice/${certCode}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? t("back")}
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {certName}
          </span>
          <span className="text-sm text-muted-foreground">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowAnswerCard((v) => !v)}
            aria-label={t("toggleAnswerCard")}
          >
            <ClipboardList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Question area */}
        <div className="min-w-0 flex-1 lg:max-w-[70%]">
          {question ? (
            <QuestionDisplay
              question={question}
              questionIndex={currentIndex}
              totalCount={questions.length}
              selectedIds={selectedIds}
              onSelect={handleSelectOption}
              isSubmitted={isSubmitted}
              isCorrect={answerState?.isCorrect ?? null}
              correctOptionIds={answerState?.correctOptionIds ?? []}
              explanation={answerState?.explanation ?? ""}
              isLocked={!question.is_free}
            />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {t("noQuestions")}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {!isSubmitted ? (
              <Button
                disabled={selectedIds.length === 0 || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? t("submitting") : t("submitAnswer")}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex < questions.length - 1
                  ? t("nextQuestion")
                  : t("finish")}
              </Button>
            )}
          </div>
        </div>

        {/* Answer card - Desktop: always visible, Mobile: in sheet/drawer */}
        <div
          className={`shrink-0 lg:w-[300px] lg:sticky lg:top-24 ${
            showAnswerCard ? "block" : "hidden lg:block"
          }`}
        >
          <AnswerCard
            totalCount={questions.length}
            currentIndex={currentIndex}
            questionStatuses={displayStatuses}
            correctCount={correctCount}
            wrongCount={wrongCount}
            unansweredCount={unansweredCount}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t("progress")}</span>
          <span>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
