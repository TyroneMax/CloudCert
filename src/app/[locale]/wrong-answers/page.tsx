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

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select(
      "question_language, practice_auto_next_on_correct, practice_reveal_immediate, practice_always_show_explanation, practice_auto_submit"
    )
    .eq("user_id", user.id)
    .single();

  const questionLanguage = prefs?.question_language ?? locale;
  const practicePrefs =
    prefs != null
      ? {
          autoNextOnCorrect: prefs.practice_auto_next_on_correct ?? true,
          revealImmediate: prefs.practice_reveal_immediate ?? false,
          alwaysShowExplanation: prefs.practice_always_show_explanation ?? false,
          autoSubmit: prefs.practice_auto_submit ?? true,
        }
      : undefined;

  if (ids) {
    const questionIds = ids.split(",").filter(Boolean);
    const questionsResult = await getQuestionsByIds(questionIds, {
      questionLanguage,
    });
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
            practicePrefs={practicePrefs}
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
