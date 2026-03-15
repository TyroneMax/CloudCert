"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    certification: "AWS SAA-C03",
    avatar: "SC",
    content: "CloudCert made studying for my AWS exam so much easier. The multi-language support let me review questions in both English and Chinese, which helped me truly understand each concept.",
    rating: 5,
  },
  {
    name: "Takeshi Yamamoto",
    role: "DevOps Engineer",
    certification: "AWS SAA-C03",
    avatar: "TY",
    content: "The wrong answer notebook feature is a game changer. I could focus on my weak spots instead of reviewing everything again. Passed on my first try!",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    role: "Cloud Architect",
    certification: "AWS SAP-C02",
    avatar: "MG",
    content: "Detailed explanations for every question helped me understand the reasoning behind each answer. This platform is exactly what I needed for my certification prep.",
    rating: 5,
  },
];

export function TestimonialsSection() {
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("testimonialsTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("testimonialsSubtitle")}</p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex h-full flex-col rounded-xl border border-border/60 bg-card p-6">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/80">
                  &ldquo;{item.content}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">{item.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role} · {item.certification}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
