import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardClient, type DashboardTab } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
  description: "Your certification practice progress and stats.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const initialTab: DashboardTab = tab === "account" ? "account" : "overview";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/dashboard`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select(
      "ui_language, question_language, practice_auto_next_on_correct, practice_reveal_immediate, practice_always_show_explanation, practice_auto_submit"
    )
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const data = await getDashboardData(user.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <DashboardClient
            data={data}
            displayName={displayName}
            email={user.email ?? ""}
            avatarUrl={profile?.avatar_url?.trim() || null}
            locale={locale}
            initialTab={initialTab}
            uiLanguage={prefs?.ui_language ?? "en"}
            questionLanguage={prefs?.question_language ?? "en"}
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
