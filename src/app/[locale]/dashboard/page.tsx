import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
  description: "Your certification practice progress and stats.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/dashboard`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
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
            locale={locale}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
