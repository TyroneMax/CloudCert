"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqKeys = [
  { q: "faq1Q", a: "faq1A" },
  { q: "faq2Q", a: "faq2A" },
  { q: "faq3Q", a: "faq3A" },
  { q: "faq4Q", a: "faq4A" },
  { q: "faq5Q", a: "faq5A" },
  { q: "faq6Q", a: "faq6A" },
] as const;

export function FaqSection() {
  const t = useTranslations("landing");

  return (
    <section id="faq" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("faqTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t("faqSubtitle")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <Accordion className="w-full">
            {faqKeys.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{t(faq.q)}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{t(faq.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
