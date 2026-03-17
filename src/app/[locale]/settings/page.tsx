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
    .select("ui_language, question_language")
    .eq("user_id", user.id)
    .single();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8 lg:py-12">
          <SettingsClient
            displayName={profile?.display_name ?? ""}
            email={user.email ?? ""}
            uiLanguage={prefs?.ui_language ?? "en"}
            questionLanguage={prefs?.question_language ?? "en"}
            locale={locale}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
