"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Search } from "lucide-react";
import type { SearchResult } from "@/lib/data/search";

/** Highlights search keywords in text. Returns HTML string for dangerouslySetInnerHTML. */
function highlightKeywords(text: string, query: string): string {
  if (!text || !query?.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return escaped;
  const pattern = new RegExp(
    `(${words.map((w) => escapeRegex(w)).join("|")})`,
    "gi"
  );
  return escaped.replace(pattern, "<mark>$1</mark>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type SearchClientProps = {
  initialQuery: string;
  initialType: "all" | "questions" | "certifications";
  results: SearchResult;
  locale: string;
};

export function SearchClient({
  initialQuery,
  initialType,
  results,
  locale,
}: SearchClientProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<"all" | "questions" | "certifications">(initialType);

  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  const updateSearch = useCallback(
    (newQuery: string, newType: "all" | "questions" | "certifications") => {
      const params = new URLSearchParams();
      if (newQuery.trim()) params.set("q", newQuery.trim());
      if (newType !== "all") params.set("type", newType);
      router.push(`/${locale}/search${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [locale, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch(query, type);
  };

  const totalCount = results.certifications.length + results.questions.length;

  return (
    <div className="space-y-8">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("title")}
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "questions", "certifications"] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => updateSearch(query, tipo)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              type === tipo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(tipo)}
          </button>
        ))}
      </div>

      {initialQuery.trim().length < 2 ? (
        <p className="text-center text-muted-foreground">Enter at least 2 characters to search.</p>
      ) : totalCount === 0 ? (
        <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
          <p className="font-medium">{t("noResults")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("tryDifferent")}</p>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground">{t("resultsFor", { query: initialQuery })}</p>

          {results.certifications.length > 0 && (
            <section>
              <h2 className="mb-4 font-semibold">
                {t("certResults")} ({results.certifications.length})
              </h2>
              <div className="space-y-3">
                {results.certifications.map((c) => (
                  <Link
                    key={c.id}
                    href={`/${locale}/certifications/${c.code}`}
                    className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🟧</span>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.provider} · {t("questionsCount", { count: c.total_questions })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.questions.length > 0 && (
            <section>
              <h2 className="mb-4 font-semibold">
                {t("questionResults")} ({results.questions.length})
              </h2>
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/${locale}/certifications/${q.cert_code}?ids=${q.id}`}
                    className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <p className="text-xs text-muted-foreground">
                      {q.cert_name} › {q.category_name}
                    </p>
                    <p
                      className="mt-1 line-clamp-2 [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-900/60 [&_mark]:rounded [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{
                        __html: highlightKeywords(q.question_text, initialQuery),
                      }}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {q.difficulty} · {q.question_type}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
