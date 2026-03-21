"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

const LS_AUTO_NEXT = "practice_autoNextOnCorrect";
const LS_REVEAL = "practice_revealImmediate";
const LS_ALWAYS_EXPL = "practice_alwaysShowExplanation";
const LS_AUTO_SUBMIT = "practice_autoSubmit";

type SettingsClientProps = {
  displayName: string;
  email: string;
  uiLanguage: string;
  questionLanguage: string;
  locale: string;
  practiceAutoNextOnCorrect: boolean;
  practiceRevealImmediate: boolean;
  practiceAlwaysShowExplanation: boolean;
  practiceAutoSubmit: boolean;
};

export function SettingsClient({
  displayName: initialDisplayName,
  email,
  uiLanguage: initialUiLanguage,
  questionLanguage: initialQuestionLanguage,
  locale,
  practiceAutoNextOnCorrect: initialAutoNext,
  practiceRevealImmediate: initialReveal,
  practiceAlwaysShowExplanation: initialAlwaysExpl,
  practiceAutoSubmit: initialAutoSubmit,
}: SettingsClientProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [uiLanguage, setUiLanguage] = useState(initialUiLanguage);
  const [questionLanguage, setQuestionLanguage] = useState(initialQuestionLanguage);
  const [practiceAutoNext, setPracticeAutoNext] = useState(initialAutoNext);
  const [practiceReveal, setPracticeReveal] = useState(initialReveal);
  const [practiceAlwaysExpl, setPracticeAlwaysExpl] = useState(initialAlwaysExpl);
  const [practiceAutoSubmit, setPracticeAutoSubmit] = useState(initialAutoSubmit);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from("users").update({ display_name: displayName }).eq("id", user.id);
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const prefsPayload = {
        ui_language: uiLanguage,
        question_language: questionLanguage,
        practice_auto_next_on_correct: practiceAutoNext,
        practice_reveal_immediate: practiceReveal,
        practice_always_show_explanation: practiceAlwaysExpl,
        practice_auto_submit: practiceAutoSubmit,
      };

      if (prefs) {
        await supabase.from("user_preferences").update(prefsPayload).eq("user_id", user.id);
      } else {
        await supabase.from("user_preferences").insert({
          user_id: user.id,
          ...prefsPayload,
        });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(LS_AUTO_NEXT, String(practiceAutoNext));
        localStorage.setItem(LS_REVEAL, String(practiceReveal));
        localStorage.setItem(LS_ALWAYS_EXPL, String(practiceAlwaysExpl));
        localStorage.setItem(LS_AUTO_SUBMIT, String(practiceAutoSubmit));
      }

      setSaved(true);
      router.refresh();
      if (uiLanguage !== locale) {
        window.location.href = `/${uiLanguage}/settings`;
      }
    } catch {
      // TODO: toast error
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  };

  return (
    <div className="space-y-8">
      <Link
        href={`/${locale}/dashboard`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("dashboard")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">{t("profile")}</h2>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {t("displayName")}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("email")}</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
          />
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">{t("language")}</h2>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("uiLanguage")}</label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("questionLanguage")}</label>
          <select
            value={questionLanguage}
            onChange={(e) => setQuestionLanguage(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">{t("practiceSection")}</h2>
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-sm font-medium">{t("practiceAutoNext")}</p>
            <p className="text-xs text-muted-foreground">{t("practiceAutoNextDesc")}</p>
          </div>
          <Switch checked={practiceAutoNext} onCheckedChange={setPracticeAutoNext} />
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-sm font-medium">{t("practiceAlwaysExpl")}</p>
            <p className="text-xs text-muted-foreground">{t("practiceAlwaysExplDesc")}</p>
          </div>
          <Switch checked={practiceAlwaysExpl} onCheckedChange={setPracticeAlwaysExpl} />
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-sm font-medium">{t("practiceAutoSubmit")}</p>
            <p className="text-xs text-muted-foreground">{t("practiceAutoSubmitDesc")}</p>
          </div>
          <Switch checked={practiceAutoSubmit} onCheckedChange={setPracticeAutoSubmit} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{t("practiceReveal")}</p>
            <p className="text-xs text-muted-foreground">{t("practiceRevealDesc")}</p>
          </div>
          <Switch checked={practiceReveal} onCheckedChange={setPracticeReveal} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
          {isSaving ? t("saving") : saved ? t("saved") : t("save")}
        </Button>
        <Button variant="outline" onClick={handleLogout} className="rounded-xl">
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
