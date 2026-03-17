"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Send,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuestionDisplay } from "./question-display";
import { AnswerCard, type QuestionStatus } from "./answer-card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  memorizationMode?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function QuizView({
  certCode,
  certName,
  questions,
  startIndex,
  mode,
  memorizationMode = false,
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [answerCardOpen, setAnswerCardOpen] = useState(false);
  const [memorizationAnswer, setMemorizationAnswer] = useState<{
    correctOptionIds: string[];
    explanation: string;
  } | null>(null);
  const [autoNextOnCorrect, setAutoNextOnCorrect] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("practice_autoNextOnCorrect");
    return stored !== "false";
  });
  const question = questions[currentIndex];
  const answerState = question ? answers.get(question.id) : null;
  const isSubmitted = !!answerState || (memorizationMode && !!memorizationAnswer);

  // Sync selectedIds when switching questions
  useEffect(() => {
    if (question) {
      const state = answers.get(question.id);
      setSelectedIds(state?.selectedIds ?? []);
    }
  }, [currentIndex, question?.id, answers]);

  // Scroll to top when changing questions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  // Persist autoNextOnCorrect
  useEffect(() => {
    localStorage.setItem("practice_autoNextOnCorrect", String(autoNextOnCorrect));
  }, [autoNextOnCorrect]);

  // Fetch answer for memorization mode
  useEffect(() => {
    if (!memorizationMode || !question) return;
    setMemorizationAnswer(null);
    fetch(`/api/question-answer?questionId=${question.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.correctOptionIds !== undefined) {
          setMemorizationAnswer({
            correctOptionIds: data.correctOptionIds ?? [],
            explanation: data.explanation ?? "",
          });
        }
      })
      .catch(() => {});
  }, [memorizationMode, question?.id]);

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
    setSubmitError(null);
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

      const newAnswers = new Map(answers).set(question.id, {
        selectedIds: [...selectedIds],
        isCorrect: data.isCorrect,
        correctOptionIds: data.correctOptionIds ?? [],
        explanation: data.explanation ?? "",
      });
      setAnswers(newAnswers);
      if (data.isCorrect && autoNextOnCorrect) {
        setTimeout(() => {
          if (currentIndex >= questions.length - 1) {
            window.location.href = `/${locale}/dashboard`;
          } else {
            setSelectedIds([]);
            setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
          }
        }, 600);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    question,
    selectedIds,
    isSubmitting,
    autoNextOnCorrect,
    currentIndex,
    questions.length,
    locale,
    answers,
  ]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => Math.max(0, i - 1));
    }
  }, [currentIndex]);

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
      {/* Nav bar + Action buttons */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={backHref ?? `/${locale}/practice/${certCode}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? t("back")}
        </Link>

        {/* Icon action buttons - top */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            aria-label={t("prevQuestion")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!memorizationMode && !isSubmitted ? (
            <Button
              size="icon-sm"
              disabled={selectedIds.length === 0 || isSubmitting}
              onClick={handleSubmit}
              aria-label={t("submitAnswer")}
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon-sm"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
              aria-label={
                currentIndex < questions.length - 1
                  ? t("nextQuestion")
                  : t("finish")
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {!memorizationMode && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t("autoNextOnCorrect")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("autoNextOnCorrect")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAutoNextOnCorrect((v) => !v)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      autoNextOnCorrect
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span>{autoNextOnCorrect ? "⏭" : "⏸"}</span>
                    {autoNextOnCorrect ? t("on") : t("off")}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Sheet open={answerCardOpen} onOpenChange={setAnswerCardOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="lg:hidden"
                aria-label={t("toggleAnswerCard")}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh]">
              <AnswerCard
                questions={questions}
                currentIndex={currentIndex}
                questionStatuses={displayStatuses}
                correctCount={correctCount}
                wrongCount={wrongCount}
                unansweredCount={unansweredCount}
                onQuestionClick={(i) => {
                  handleQuestionClick(i);
                  setAnswerCardOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
          <span className="ml-2 rounded-full bg-muted px-3 py-1 text-sm font-medium">
            {certName}
          </span>
          <span className="text-sm text-muted-foreground">
            Q {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Question area */}
        <div className="min-w-0 flex-1 lg:max-w-[70%]">
          {question ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionDisplay
              question={question}
              questionIndex={currentIndex}
              totalCount={questions.length}
              selectedIds={memorizationMode ? [] : selectedIds}
              onSelect={handleSelectOption}
              isSubmitted={isSubmitted}
              isCorrect={memorizationMode ? true : (answerState?.isCorrect ?? null)}
              correctOptionIds={
                memorizationMode
                  ? (memorizationAnswer?.correctOptionIds ?? [])
                  : (answerState?.correctOptionIds ?? [])
              }
              explanation={
                memorizationMode
                  ? (memorizationAnswer?.explanation ?? "")
                  : (answerState?.explanation ?? "")
              }
              isLocked={!question.is_free}
              isReviewMode={memorizationMode}
            />
            </motion.div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {t("noQuestions")}
            </div>
          )}

          {!memorizationMode && submitError && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>{t("submitError")}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitError(null);
                  handleSubmit();
                }}
              >
                {t("retry")}
              </Button>
            </div>
          )}
        </div>

        {/* Answer card - Desktop: always visible, Mobile: in Sheet */}
        <div className="hidden shrink-0 lg:block lg:w-[300px] lg:sticky lg:top-24">
          <AnswerCard
            questions={questions}
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
