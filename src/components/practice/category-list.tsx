"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/lib/data/practice";

type CategoryListProps = {
  categories: Category[];
  certCode: string;
};

export function CategoryList({ categories, certCode }: CategoryListProps) {
  const t = useTranslations("practice");
  const locale = useLocale();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t("byCategory")}</h3>
      <ul className="space-y-2">
        {categories.map((cat) => {
          const percent =
            cat.question_count > 0
              ? Math.round((cat.answered_count / cat.question_count) * 100)
              : 0;
          return (
            <li key={cat.id}>
              <Link
                href={`/${locale}/practice/${certCode}?mode=category&category=${cat.id}`}
                className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{cat.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {cat.answered_count}/{cat.question_count}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span>{percent}%</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
