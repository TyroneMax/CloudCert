"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MousePointerClick, BookOpenCheck, GraduationCap } from "lucide-react";

const steps = [
  { step: 1, icon: MousePointerClick, titleKey: "step1Title", descKey: "step1Desc", color: "bg-blue-600" },
  { step: 2, icon: BookOpenCheck, titleKey: "step2Title", descKey: "step2Desc", color: "bg-indigo-600" },
  { step: 3, icon: GraduationCap, titleKey: "step3Title", descKey: "step3Desc", color: "bg-violet-600" },
] as const;

export function HowItWorksSection() {
  const t = useTranslations("landing");

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("howTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("howSubtitle")}</p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200 lg:block" aria-hidden="true" />
          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-md ring-4 ring-background">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <span className="mb-2 block text-sm font-semibold text-blue-600">Step {step.step}</span>
                <h3 className="text-xl font-semibold">{t(step.titleKey)}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
