import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { getWrongAnswers } from "@/lib/data/wrong-answers";
import { getQuestionsByIds } from "@/lib/data/questions";
import { WrongAnswersClient } from "./wrong-answers-client";
import { QuizView } from "@/components/practice/quiz-view";

export const metadata = {
  title: "Wrong Answers",
  description: "Review and redo your wrong answers.",
  robots: { index: false, follow: false },
};

export default async function WrongAnswersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cert?: string; category?: string; ids?: string }>;
}) {
  const { locale } = await params;
  const { cert, category, ids } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/wrong-answers`);
  }

  if (ids) {
    const questionIds = ids.split(",").filter(Boolean);
    const questionsResult = await getQuestionsByIds(questionIds, { locale });
    if (!questionsResult || questionsResult.questions.length === 0) {
      redirect(`/${locale}/wrong-answers`);
    }
    const t = await getTranslations("wrongAnswers");
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <QuizView
            certCode="wrong-answers"
            certName={t("title")}
            questions={questionsResult.questions}
            startIndex={1}
            mode="all"
            backHref={`/${locale}/wrong-answers`}
            backLabel={t("back")}
          />
        </main>
        <Footer />
      </>
    );
  }

  const data = await getWrongAnswers(user.id, {
    certCode: cert ?? undefined,
    categoryId: category ?? undefined,
    locale,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
          <WrongAnswersClient
            data={data}
            locale={locale}
            certFilter={cert}
            categoryFilter={category}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
