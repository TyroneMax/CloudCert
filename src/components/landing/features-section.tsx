"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Globe, BookOpen, FileText, BarChart3 } from "lucide-react";

const featureKeys = [
  { icon: Globe, titleKey: "feature1Title", descKey: "feature1Desc", color: "bg-blue-100 text-blue-600" },
  { icon: BookOpen, titleKey: "feature2Title", descKey: "feature2Desc", color: "bg-purple-100 text-purple-600" },
  { icon: FileText, titleKey: "feature3Title", descKey: "feature3Desc", color: "bg-orange-100 text-orange-600" },
  { icon: BarChart3, titleKey: "feature4Title", descKey: "feature4Desc", color: "bg-green-100 text-green-600" },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  const t = useTranslations("landing");

  return (
    <section id="features" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("featuresTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("featuresSubtitle")}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featureKeys.map((feature) => (
            <motion.div key={feature.titleKey} variants={itemVariants}>
              <div className="group h-full rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{t(feature.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(feature.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
