"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Languages,
  Send,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QuestionDisplay } from "./question-display";
import { AnswerCard, type QuestionStatus } from "./answer-card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import type { Question } from "@/lib/data/questions";

const LS_AUTO_NEXT = "practice_autoNextOnCorrect";
const LS_REVEAL = "practice_revealImmediate";
const LS_ALWAYS_EXPL = "practice_alwaysShowExplanation";
const LS_AUTO_SUBMIT = "practice_autoSubmit";

type AnswerState = {
  selectedIds: string[];
  isCorrect: boolean | null;
  correctOptionIds: string[];
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
  practicePrefs?: {
    autoNextOnCorrect: boolean;
    revealImmediate: boolean;
    alwaysShowExplanation: boolean;
    autoSubmit: boolean;
  };
};

async function persistPracticePrefs(prefs: {
  autoNextOnCorrect: boolean;
  revealImmediate: boolean;
  alwaysShowExplanation: boolean;
  autoSubmit: boolean;
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_AUTO_NEXT, String(prefs.autoNextOnCorrect));
  localStorage.setItem(LS_REVEAL, String(prefs.revealImmediate));
  localStorage.setItem(LS_ALWAYS_EXPL, String(prefs.alwaysShowExplanation));
  localStorage.setItem(LS_AUTO_SUBMIT, String(prefs.autoSubmit));
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("user_preferences")
    .update({
      practice_auto_next_on_correct: prefs.autoNextOnCorrect,
      practice_reveal_immediate: prefs.revealImmediate,
      practice_always_show_explanation: prefs.alwaysShowExplanation,
      practice_auto_submit: prefs.autoSubmit,
    })
    .eq("user_id", user.id);
}

export function QuizView({
  certCode,
  certName,
  questions,
  startIndex,
  mode,
  memorizationMode = false,
  backHref,
  backLabel,
  practicePrefs,
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

  const [autoNextOnCorrect, setAutoNextOnCorrect] = useState(
    () => practicePrefs?.autoNextOnCorrect ?? true
  );
  const [revealImmediate, setRevealImmediate] = useState(
    () => memorizationMode || (practicePrefs?.revealImmediate ?? false)
  );
  const [alwaysShowExplanation, setAlwaysShowExplanation] = useState(
    () => practicePrefs?.alwaysShowExplanation ?? false
  );
  const [autoSubmit, setAutoSubmit] = useState(
    () => practicePrefs?.autoSubmit ?? true
  );

  const [contentLocale, setContentLocale] = useState(
    () => questions[0]?.defaultContentLocale ?? "en"
  );

  const submitLockRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const studyRevealActive = memorizationMode || revealImmediate;

  const question = questions[currentIndex];
  const answerState = question ? answers.get(question.id) : null;

  const contentLocales = useMemo(() => {
    const keys = new Set<string>();
    questions.forEach((q) => {
      Object.keys(q.contentByLocale).forEach((k) => keys.add(k));
    });
    return Array.from(keys).sort();
  }, [questions]);

  const canToggleContentLang = contentLocales.length >= 2;

  const langLabel = useMemo(() => {
    try {
      const dn = new Intl.DisplayNames([locale], { type: "language" });
      const map: Record<string, string> = {};
      contentLocales.forEach((code) => {
        map[code] = code === "en" ? "EN" : dn.of(code) ?? code.toUpperCase();
      });
      return map;
    } catch {
      const map: Record<string, string> = {};
      contentLocales.forEach((code) => {
        map[code] = code.toUpperCase();
      });
      return map;
    }
  }, [contentLocales, locale]);

  useEffect(() => {
    if (practicePrefs) return;
    if (typeof window === "undefined") return;
    const a = localStorage.getItem(LS_AUTO_NEXT);
    const r = localStorage.getItem(LS_REVEAL);
    const e = localStorage.getItem(LS_ALWAYS_EXPL);
    const s = localStorage.getItem(LS_AUTO_SUBMIT);
    if (a !== null) setAutoNextOnCorrect(a !== "false");
    if (r !== null && !memorizationMode) setRevealImmediate(r === "true");
    if (e !== null) setAlwaysShowExplanation(e === "true");
    if (s !== null) setAutoSubmit(s !== "false");
  }, [practicePrefs, memorizationMode]);

  useEffect(() => {
    if (question) {
      const state = answers.get(question.id);
      setSelectedIds(state?.selectedIds ?? []);
    }
  }, [currentIndex, question?.id, answers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, [currentIndex]);

  useEffect(() => {
    if (memorizationMode) {
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_AUTO_NEXT, String(autoNextOnCorrect));
      }
      return;
    }
    void persistPracticePrefs({
      autoNextOnCorrect,
      revealImmediate,
      alwaysShowExplanation,
      autoSubmit,
    });
  }, [
    autoNextOnCorrect,
    revealImmediate,
    alwaysShowExplanation,
    autoSubmit,
    memorizationMode,
  ]);

  const scheduleAdvanceIfCorrect = useCallback(
    (isCorrect: boolean) => {
      if (!isCorrect || !autoNextOnCorrect) return;
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      const delay = alwaysShowExplanation ? 2200 : 600;
      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        setCurrentIndex((i) => {
          if (i >= questions.length - 1) {
            window.location.href = `/${locale}/dashboard`;
            return i;
          }
          return i + 1;
        });
        setSelectedIds([]);
      }, delay);
    },
    [autoNextOnCorrect, alwaysShowExplanation, questions.length, locale]
  );

  const submitCurrentAnswer = useCallback(async () => {
    if (!question || studyRevealActive) return;
    if (answers.has(question.id)) return;
    if (selectedIds.length === 0) return;
    if (submitLockRef.current) return;
    submitLockRef.current = true;
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

      const correctIds = (data.correctOptionIds ?? question.correctOptionIds) as string[];
      setAnswers((prev) => {
        const next = new Map(prev).set(question.id, {
          selectedIds: [...selectedIds],
          isCorrect: data.isCorrect,
          correctOptionIds: correctIds,
        });
        return next;
      });
      scheduleAdvanceIfCorrect(!!data.isCorrect);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }, [question, selectedIds, studyRevealActive, scheduleAdvanceIfCorrect]);

  useEffect(() => {
    if (!autoSubmit || studyRevealActive || !question) return;
    if (answers.has(question.id)) return;
    if (isSubmitting) return;
    const need = question.correctOptionIds.length;
    if (need === 0 || selectedIds.length !== need) return;
    void submitCurrentAnswer();
  }, [
    autoSubmit,
    studyRevealActive,
    question,
    selectedIds,
    answers,
    isSubmitting,
    submitCurrentAnswer,
  ]);

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!question) return;
      if (studyRevealActive) return;
      if (answers.has(question.id)) return;
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
    [question, studyRevealActive, answers]
  );

  const handleSubmit = useCallback(() => {
    void submitCurrentAnswer();
  }, [submitCurrentAnswer]);

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

  const progressPercent =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  const showSubmitButton =
    !studyRevealActive &&
    !answerState &&
    !autoSubmit &&
    selectedIds.length > 0;

  const showNextButton = studyRevealActive || !!answerState;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={backHref ?? `/${locale}/certifications/${certCode}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? t("back")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-3"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              aria-label={t("prevQuestion")}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("prevQuestion")}</span>
            </Button>
          </div>

          {showSubmitButton ? (
            <Button
              size="sm"
              className="h-9 rounded-xl px-4 shadow-sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
              aria-label={t("submitAnswer")}
            >
              <Send className="h-4 w-4 sm:mr-1" />
              {t("submitAnswer")}
            </Button>
          ) : null}

          {showNextButton ? (
            <Button
              size="sm"
              className="h-9 rounded-xl px-4"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
              aria-label={
                currentIndex < questions.length - 1
                  ? t("nextQuestion")
                  : t("finish")
              }
            >
              <ChevronRight className="h-4 w-4 sm:mr-1" />
              {currentIndex < questions.length - 1
                ? t("nextQuestion")
                : t("finish")}
            </Button>
          ) : null}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-xl"
                aria-label={t("quizSettings")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="max-h-[min(420px,70vh)] w-72 space-y-3 overflow-y-auto"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{t("autoNextOnCorrect")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("autoNextOnCorrectHint")}
                  </p>
                </div>
                <Switch
                  checked={autoNextOnCorrect}
                  onCheckedChange={setAutoNextOnCorrect}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-sm font-medium">{t("alwaysShowExplanation")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("alwaysShowExplanationHint")}
                  </p>
                </div>
                <Switch
                  checked={alwaysShowExplanation}
                  onCheckedChange={setAlwaysShowExplanation}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-sm font-medium">{t("autoSubmit")}</p>
                  <p className="text-xs text-muted-foreground">{t("autoSubmitHint")}</p>
                </div>
                <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-sm font-medium">{t("revealStudyMode")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("revealStudyModeHint")}
                  </p>
                </div>
                <Switch
                  checked={memorizationMode ? true : revealImmediate}
                  onCheckedChange={(v) => !memorizationMode && setRevealImmediate(v)}
                  disabled={memorizationMode}
                />
              </div>
            </PopoverContent>
          </Popover>

          {canToggleContentLang && (
            <div
              className="flex items-center gap-1 rounded-xl border border-border/80 bg-card p-1"
              role="group"
              aria-label={t("questionLanguageToggle")}
            >
              <Languages className="mx-1 h-4 w-4 text-muted-foreground" />
              {contentLocales.map((code) => (
                <Button
                  key={code}
                  type="button"
                  variant={contentLocale === code ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                  onClick={() => setContentLocale(code)}
                >
                  {langLabel[code] ?? code}
                </Button>
              ))}
            </div>
          )}

          <Sheet open={answerCardOpen} onOpenChange={setAnswerCardOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="rounded-xl lg:hidden"
                aria-label={t("toggleAnswerCard")}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh]">
              <AnswerCard
                questions={questions}
                currentIndex={currentIndex}
                questionStatuses={questionStatuses}
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

          <span className="hidden rounded-full bg-muted px-3 py-1 text-sm font-medium sm:inline-flex">
            {certName}
          </span>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            Q {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-[70%]">
          {question ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionDisplay
                question={question}
                contentLocale={contentLocale}
                questionIndex={currentIndex}
                totalCount={questions.length}
                selectedIds={studyRevealActive ? [] : selectedIds}
                onSelect={handleSelectOption}
                isSubmitted={!!answerState || studyRevealActive}
                isCorrect={
                  studyRevealActive ? true : (answerState?.isCorrect ?? null)
                }
                correctOptionIds={
                  studyRevealActive
                    ? question.correctOptionIds
                    : (answerState?.correctOptionIds ?? [])
                }
                isLocked={!question.is_free}
                isReviewMode={studyRevealActive}
                optionsDisabled={isSubmitting}
                alwaysShowExplanationWhenCorrect={alwaysShowExplanation}
              />
            </motion.div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              {t("noQuestions")}
            </div>
          )}

          {!studyRevealActive && submitError && (
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

        <div className="hidden shrink-0 lg:block lg:w-[min(100%,320px)] lg:sticky lg:top-24">
          <AnswerCard
            questions={questions}
            currentIndex={currentIndex}
            questionStatuses={questionStatuses}
            correctCount={correctCount}
            wrongCount={wrongCount}
            unansweredCount={unansweredCount}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t("progress")}</span>
          <span className="tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
