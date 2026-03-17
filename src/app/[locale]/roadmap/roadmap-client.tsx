"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Map, Check, Circle, ArrowLeft } from "lucide-react";

const PHASE1_ITEMS = [
  "AWS Certification Question Bank",
  "Web Application",
  "Google + Email Authentication",
  "Multi-language Support (EN, ZH, JA, KO)",
  "Question Explanations",
  "Wrong Answer Review",
  "Search (Questions + Certifications)",
  "Practice Progress Tracking",
  "Freemium Model",
];

const PHASE2_ITEMS = [
  "Exam Simulation Mode (Timed Mock Exams)",
  "Bookmark / Favorites",
  "Dark Mode",
  "Spaced Repetition (Anki-style Algorithm)",
  "More AWS Certifications (SAP, DVA, etc.)",
  "Performance & UX Optimization",
];

const PHASE3_ITEMS = [
  "Azure Certification Question Banks",
  "GCP Certification Question Banks",
  "Apple Sign-In",
  "iOS Mobile App (React Native)",
  "Community Features",
  "AI-Powered Explanations",
  "More Certification Providers",
];

export function RoadmapClient({ locale }: { locale: string }) {
  const t = useTranslations("roadmap");

  return (
    <div className="space-y-12">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <Map className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t("phase1")}</h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-400">
            {t("statusInProgress")}
          </span>
        </div>
        <ul className="space-y-2">
          {PHASE1_ITEMS.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t("phase2")}</h2>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400">
            {t("statusPlanned")}
          </span>
        </div>
        <ul className="space-y-2">
          {PHASE2_ITEMS.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t("phase3")}</h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
            {t("statusFuture")}
          </span>
        </div>
        <ul className="space-y-2">
          {PHASE3_ITEMS.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
        <p className="font-medium">{t("feedbackTitle")}</p>
        <a
          href="mailto:feedback@cloudcert.com?subject=Feature%20Request"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("feedbackButton")}
        </a>
      </section>
    </div>
  );
}
