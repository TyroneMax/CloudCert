"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

type SettingsClientProps = {
  displayName: string;
  email: string;
  uiLanguage: string;
  questionLanguage: string;
  locale: string;
};

export function SettingsClient({
  displayName: initialDisplayName,
  email,
  uiLanguage: initialUiLanguage,
  questionLanguage: initialQuestionLanguage,
  locale,
}: SettingsClientProps) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [uiLanguage, setUiLanguage] = useState(initialUiLanguage);
  const [questionLanguage, setQuestionLanguage] = useState(initialQuestionLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from("users").update({ display_name: displayName }).eq("id", user.id);
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (prefs) {
        await supabase
          .from("user_preferences")
          .update({ ui_language: uiLanguage, question_language: questionLanguage })
          .eq("user_id", user.id);
      } else {
        await supabase.from("user_preferences").insert({
          user_id: user.id,
          ui_language: uiLanguage,
          question_language: questionLanguage,
        });
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
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <section className="space-y-6 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">{t("profile")}</h2>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("displayName")}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("email")}</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-lg border bg-muted px-4 py-2 text-muted-foreground"
          />
        </div>
      </section>

      <section className="space-y-6 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">{t("language")}</h2>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("uiLanguage")}</label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2"
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
            className="w-full rounded-lg border bg-background px-4 py-2"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t("saving") : saved ? t("saved") : t("save")}
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
