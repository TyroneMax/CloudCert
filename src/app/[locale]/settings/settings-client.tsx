"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UserPreferencesForm } from "@/components/profile/user-preferences-form";

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
  displayName,
  email,
  uiLanguage,
  questionLanguage,
  locale,
  practiceAutoNextOnCorrect,
  practiceRevealImmediate,
  practiceAlwaysShowExplanation,
  practiceAutoSubmit,
}: SettingsClientProps) {
  const t = useTranslations("settings");

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

      <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-primary/[0.06] via-card to-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <UserPreferencesForm
        displayName={displayName}
        email={email}
        uiLanguage={uiLanguage}
        questionLanguage={questionLanguage}
        locale={locale}
        practiceAutoNextOnCorrect={practiceAutoNextOnCorrect}
        practiceRevealImmediate={practiceRevealImmediate}
        practiceAlwaysShowExplanation={practiceAlwaysShowExplanation}
        practiceAutoSubmit={practiceAutoSubmit}
        afterLocaleChange="settings"
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleLogout} className="rounded-xl">
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
