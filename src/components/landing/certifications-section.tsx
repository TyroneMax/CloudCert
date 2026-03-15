"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";

const certifications = [
  {
    provider: "AWS",
    name: "Amazon Web Services",
    icon: "🟧",
    certs: ["Solutions Architect Associate", "Developer Associate", "SysOps Administrator"],
    available: true,
    color: "border-orange-200 bg-orange-50",
  },
  {
    provider: "Azure",
    name: "Microsoft Azure",
    icon: "🔵",
    certs: ["AZ-900 Fundamentals", "AZ-104 Administrator", "AZ-204 Developer"],
    available: false,
    color: "border-blue-200 bg-blue-50",
  },
  {
    provider: "GCP",
    name: "Google Cloud Platform",
    icon: "🔴",
    certs: ["Cloud Digital Leader", "Associate Cloud Engineer", "Professional Cloud Architect"],
    available: false,
    color: "border-red-200 bg-red-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function CertificationsSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section id="certifications" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("certTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("certSubtitle")}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {certifications.map((cert) => (
            <motion.div key={cert.provider} variants={itemVariants}>
              <div className={`group relative rounded-xl border p-6 transition-shadow hover:shadow-md ${cert.color}`}>
                {cert.available ? (
                  <div className="absolute right-4 top-4 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{t("available")}</div>
                ) : (
                  <div className="absolute right-4 top-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{t("comingSoon")}</div>
                )}
                <div className="mb-4 text-4xl">{cert.icon}</div>
                <h3 className="text-xl font-semibold">{cert.provider}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cert.name}</p>
                <ul className="mt-4 space-y-2">
                  {cert.certs.map((name) => (
                    <li key={name} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                      {name}
                    </li>
                  ))}
                </ul>
                {cert.available && (
                  <Link
                    href={`/${locale}/certifications`}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    {t("browseCerts")}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
