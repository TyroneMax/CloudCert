"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Shield, BookOpen, Award } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-background py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Award className="h-4 w-4" />
              {t("badge")}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("heroTitleHighlight")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-center text-lg text-muted-foreground lg:mx-0 lg:text-left lg:text-xl">
              {t("heroSubtitle")}
            </p>

            <div className="mt-8 flex justify-center lg:justify-start">
              <Button size="lg" className="text-base" render={<Link href={`/${locale}/certifications`} />}>
                {t("ctaView")}
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-600" />
                {t("noCreditCard")}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-blue-600" />
                {t("freeQuestions")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto w-full max-w-lg">
              <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <span className="text-2xl">☁️</span>
                  </div>
                  <div>
                    <p className="font-semibold">AWS Solutions Architect</p>
                    <p className="text-sm text-muted-foreground">Associate (SAA-C03)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Q1: Which service provides...", correct: true },
                    { label: "Q2: A company needs to...", correct: true },
                    { label: "Q3: What is the best...", correct: false },
                    { label: "Q4: Which storage class...", current: true },
                  ].map((q, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                        q.current
                          ? "border-2 border-blue-500 bg-blue-50"
                          : q.correct
                            ? "bg-green-50 text-green-800"
                            : q.correct === false
                              ? "bg-red-50 text-red-800"
                              : "bg-muted"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                        {q.current ? "→" : q.correct ? "✓" : "✗"}
                      </span>
                      <span className="truncate">{q.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress: 4/65</span>
                  <span className="font-medium text-green-600">67% correct</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[6%] rounded-full bg-blue-600 transition-all" />
                </div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-xl border border-border/60 bg-card px-4 py-2 shadow-lg">
                <span className="text-sm font-semibold text-green-600">🎯 Pass Rate: 94%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
