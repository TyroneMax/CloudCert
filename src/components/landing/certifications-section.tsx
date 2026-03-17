"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Clock, ArrowRight } from "lucide-react";
import { CloudProviderLogos } from "@/components/icons/cloud-provider-logos";

const certifications = [
  {
    provider: "AWS" as const,
    name: "Amazon Web Services",
    certs: ["Solutions Architect Associate", "Developer Associate", "SysOps Administrator"],
    available: true,
    iconBg: "bg-orange-50",
  },
  {
    provider: "Azure" as const,
    name: "Microsoft Azure",
    certs: ["AZ-900 Fundamentals", "AZ-104 Administrator", "AZ-204 Developer"],
    available: false,
    iconBg: "bg-sky-50",
  },
  {
    provider: "GCP" as const,
    name: "Google Cloud Platform",
    certs: ["Cloud Digital Leader", "Associate Cloud Engineer", "Professional Cloud Architect"],
    available: false,
    iconBg: "bg-blue-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};

export function CertificationsSection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section id="certifications" className="scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
          {certifications.map((cert) => {
            const CardContent = (
              <>
                {cert.available ? (
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {t("available")}
                  </div>
                ) : (
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {t("comingSoon")}
                  </div>
                )}
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${cert.iconBg} p-2`}>
                  {(() => {
                    const Logo = CloudProviderLogos[cert.provider];
                    return <Logo size={40} />;
                  })()}
                </div>
                <h3 className="text-xl font-semibold">{cert.provider}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cert.name}</p>
                <ul className="mt-4 space-y-2">
                  {cert.certs.map((name) => (
                    <li key={name} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden />
                      {name}
                    </li>
                  ))}
                </ul>
                {cert.available && (
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary/90">
                    {t("browseCerts")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                )}
              </>
            );

            return (
              <motion.div key={cert.provider} variants={itemVariants}>
                {cert.available ? (
                  <Link
                    href={`/${locale}/certifications`}
                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`${cert.provider} - ${t("browseCerts")}`}
                  >
                    {CardContent}
                  </Link>
                ) : (
                  <div
                    className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-6 transition-shadow"
                    aria-label={`${cert.provider} - ${t("comingSoon")}`}
                  >
                    {CardContent}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
