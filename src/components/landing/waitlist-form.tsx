"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";

type Variant = "hero" | "cta";

export function WaitlistForm({ variant = "hero" }: { variant?: Variant }) {
  const t = useTranslations("landing");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const isHero = variant === "hero";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        locale,
        source: variant,
      });

      if (error) {
        if (error.code === "23505") {
          setStatus("duplicate");
        } else {
          setStatus("error");
        }
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center gap-3 rounded-xl px-5 py-4 ${
          isHero
            ? "bg-green-50 text-green-800"
            : "bg-white/15 text-white"
        }`}
      >
        <CheckCircle className={`h-5 w-5 shrink-0 ${isHero ? "text-green-600" : "text-green-300"}`} />
        <div className="text-sm font-medium">
          <p>{status === "success" ? t("waitlistSuccess") : t("waitlistAlreadyJoined")}</p>
          {status === "success" && (
            <p className={`mt-0.5 font-normal ${isHero ? "text-green-600" : "text-blue-200"}`}>
              {t("waitlistSuccessDesc")}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
          isHero ? "text-muted-foreground" : "text-blue-300"
        }`} />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={t("waitlistPlaceholder")}
          className={`h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 ${
            isHero
              ? "border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20"
              : "border-white/20 bg-white/10 text-white placeholder:text-blue-200 focus:border-white/40 focus:ring-white/20"
          }`}
        />
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className={`h-11 gap-2 px-5 ${
          isHero
            ? ""
            : "bg-white text-blue-700 hover:bg-blue-50"
        }`}
      >
        {status === "loading" ? t("waitlistJoining") : t("waitlistButton")}
        {status !== "loading" && <ArrowRight className="h-4 w-4" />}
      </Button>
      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-xs sm:col-span-2 ${isHero ? "text-red-500" : "text-red-300"}`}
          >
            {t("waitlistError")}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
