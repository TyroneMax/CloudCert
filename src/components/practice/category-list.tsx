"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ChevronRight, FolderOpen } from "lucide-react";
import type { Category } from "@/lib/data/practice";

const providerBorder: Record<string, string> = {
  AWS: "border-l-orange-400",
  Azure: "border-l-sky-400",
  GCP: "border-l-blue-400",
};

const providerProgressBar: Record<string, string> = {
  AWS: "bg-gradient-to-r from-orange-400 to-amber-500",
  Azure: "bg-gradient-to-r from-sky-400 to-blue-600",
  GCP: "bg-gradient-to-r from-blue-400 to-indigo-500",
};

type CategoryListProps = {
  categories: Category[];
  certCode: string;
  provider?: string;
};

export function CategoryList({ categories, certCode, provider = "AWS" }: CategoryListProps) {
  const t = useTranslations("practice");
  const locale = useLocale();
  const borderClass = providerBorder[provider] ?? "border-l-primary";
  const progressBarClass = providerProgressBar[provider] ?? "bg-primary";

  if (categories.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <FolderOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
        {t("byCategory")}
      </h3>
      <ul className="mt-4 space-y-3">
        {categories.map((cat, i) => {
          const percent =
            cat.question_count > 0
              ? Math.round((cat.answered_count / cat.question_count) * 100)
              : 0;

          return (
            <motion.li
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/${locale}/certifications/${certCode}?mode=category&category=${cat.id}`}
                className={`group flex items-center gap-4 rounded-xl border border-l-4 bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${borderClass}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{cat.name}</p>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="tabular-nums">
                      {cat.answered_count}/{cat.question_count}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`h-1.5 rounded-full ${progressBarClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + i * 0.04 }}
                      />
                    </div>
                    <span className="tabular-nums font-medium">{percent}%</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
