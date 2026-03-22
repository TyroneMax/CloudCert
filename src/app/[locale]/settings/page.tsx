import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings",
  description: "Manage your account and preferences.",
  robots: { index: false, follow: false },
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/settings`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", user.id)
    .single();

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select(
      "ui_language, question_language, practice_auto_next_on_correct, practice_reveal_immediate, practice_always_show_explanation, practice_auto_submit"
    )
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
          <SettingsClient
            displayName={profile?.display_name ?? ""}
            email={user.email ?? ""}
            uiLanguage={prefs?.ui_language ?? "en"}
            questionLanguage={prefs?.question_language ?? "en"}
            locale={locale}
            practiceAutoNextOnCorrect={prefs?.practice_auto_next_on_correct ?? true}
            practiceRevealImmediate={prefs?.practice_reveal_immediate ?? false}
            practiceAlwaysShowExplanation={prefs?.practice_always_show_explanation ?? false}
            practiceAutoSubmit={prefs?.practice_auto_submit ?? true}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
