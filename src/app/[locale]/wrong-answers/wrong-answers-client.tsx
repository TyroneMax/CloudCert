"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { WrongAnswersResult } from "@/lib/data/wrong-answers";

type WrongAnswersClientProps = {
  data: WrongAnswersResult;
  locale: string;
  certFilter?: string;
  categoryFilter?: string;
};

export function WrongAnswersClient({
  data,
  locale,
  certFilter,
  categoryFilter,
}: WrongAnswersClientProps) {
  const t = useTranslations("wrongAnswers");
  const { items, total } = data;

  const certs = [...new Set(items.map((i) => ({ code: i.certification_code, name: i.certification_name })))];
  const uniqueCerts = certs.filter((c, i, arr) => arr.findIndex((x) => x.code === c.code) === i);
  const categories = [...new Set(items.map((i) => ({ id: i.category_id, name: i.category_name })))];
  const uniqueCategories = categories.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("total", { count: total })}</p>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}/wrong-answers`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !certFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Certs
              </Link>
              {uniqueCerts.map((c) => (
                <Link
                  key={c.code}
                  href={`/${locale}/wrong-answers?cert=${encodeURIComponent(c.code)}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    certFilter === c.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/wrong-answers?ids=${items.map((i) => i.question_id).join(",")}`}
              className="ml-auto"
            >
              <Button>
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("redoAll")}
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <WrongAnswerCards items={items} locale={locale} t={t} formatDate={formatDate} />
          </div>
        </>
      )}
    </div>
  );
}

function WrongAnswerCards({
  items,
  locale,
  t,
  formatDate,
}: {
  items: WrongAnswersResult["items"];
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  formatDate: (s: string) => string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      {items.map((item, i) => (
        <WrongAnswerCard
          key={item.question_id}
          item={item}
          locale={locale}
          t={t}
          formatDate={formatDate}
          index={i}
          isExpanded={expandedId === item.question_id}
          onToggle={() => setExpandedId((id) => (id === item.question_id ? null : item.question_id))}
        />
      ))}
    </>
  );
}

function WrongAnswerCard({
  item,
  locale,
  t,
  formatDate,
  index,
  isExpanded,
  onToggle,
}: {
  item: WrongAnswersResult["items"][0];
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  formatDate: (s: string) => string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const attemptText = item.attempt_count === 1 ? t("attemptedOnce") : t("attempted", { count: item.attempt_count });

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{item.certification_name}</span>
            <span>›</span>
            <span>{item.category_name}</span>
          </div>
          <p className="mt-2 line-clamp-2 font-medium">{item.question_text}</p>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">{t("yourAnswer")}:</span>{" "}
              {item.selected_option_labels.length > 0 ? item.selected_option_labels.join(", ") : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">{t("correct")}:</span>{" "}
              {item.correct_option_labels.join(", ")}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {attemptText} · {t("lastAttempt", { date: formatDate(item.last_attempted_at) })}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={onToggle}>
            {t("viewDetail")}
          </Button>
          <Button size="sm" render={<Link href={`/${locale}/wrong-answers?ids=${item.question_id}`} />}>
            {t("redo")}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-6 border-t pt-6">
              <h4 className="text-sm font-medium text-muted-foreground">{t("viewDetail")}</h4>
              <MarkdownContent
                content={item.explanation || "No explanation available."}
                className="text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
