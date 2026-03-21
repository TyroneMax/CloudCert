import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { getPracticeEntryData } from "@/lib/data/practice";
import { getQuestionsForPractice, getQuestionsByIds } from "@/lib/data/questions";
import { PracticeEntry } from "@/components/practice/practice-entry";
import { QuizView } from "@/components/practice/quiz-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certId: string; locale: string }>;
}) {
  const { certId } = await params;
  const data = await getPracticeEntryData(certId);
  if (!data) return { title: "Practice" };
  return {
    title: `${data.certification.name} - Practice`,
    description: `Practice ${data.certification.total_questions} questions for ${data.certification.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CertificationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ certId: string; locale: string }>;
  searchParams: Promise<{ start?: string; mode?: string; category?: string; ids?: string }>;
}) {
  const { certId, locale } = await params;
  const { start, mode, category, ids } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entryData = await getPracticeEntryData(certId, {
    locale,
    userId: user?.id ?? null,
  });
  if (!entryData) notFound();

  const showQuiz =
    start ||
    (mode === "category" && category) ||
    mode === "memorization" ||
    ids;

  let questionLanguage = locale;
  let practicePrefs:
    | {
        autoNextOnCorrect: boolean;
        revealImmediate: boolean;
        alwaysShowExplanation: boolean;
        autoSubmit: boolean;
      }
    | undefined;

  if (user) {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select(
        "question_language, practice_auto_next_on_correct, practice_reveal_immediate, practice_always_show_explanation, practice_auto_submit"
      )
      .eq("user_id", user.id)
      .single();
    if (prefs?.question_language) {
      questionLanguage = prefs.question_language;
    }
    if (prefs) {
      practicePrefs = {
        autoNextOnCorrect: prefs.practice_auto_next_on_correct ?? true,
        revealImmediate: prefs.practice_reveal_immediate ?? false,
        alwaysShowExplanation: prefs.practice_always_show_explanation ?? false,
        autoSubmit: prefs.practice_auto_submit ?? true,
      };
    }
  }

  if (showQuiz) {
    let questionsResult;
    if (ids) {
      const questionIds = ids.split(",").filter(Boolean);
      questionsResult = await getQuestionsByIds(questionIds, {
        questionLanguage,
      });
    } else {
      questionsResult = await getQuestionsForPractice(certId, {
        mode: mode === "category" ? "category" : "all",
        categoryId: category ?? undefined,
        questionLanguage,
      });
    }

    const memorizationMode = mode === "memorization";

    if (!questionsResult || questionsResult.questions.length === 0) {
      notFound();
    }

    const startIndex = start ? Math.max(1, parseInt(start, 10) || 1) : 1;

    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <QuizView
            certCode={certId}
            certName={entryData.certification.name}
            questions={questionsResult.questions}
            startIndex={startIndex}
            mode={mode === "category" ? "category" : "all"}
            memorizationMode={memorizationMode}
            practicePrefs={practicePrefs}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <PracticeEntry data={entryData} />
      </main>
      <Footer />
    </>
  );
}
