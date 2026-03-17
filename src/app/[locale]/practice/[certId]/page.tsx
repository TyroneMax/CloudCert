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

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ certId: string; locale: string }>;
  searchParams: Promise<{ start?: string; mode?: string; category?: string; ids?: string }>;
}) {
  const { certId, locale } = await params;
  const { start, mode, category, ids } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const entryData = await getPracticeEntryData(certId, { locale, userId: user?.id ?? null });
  if (!entryData) notFound();

  const showQuiz =
    start ||
    (mode === "category" && category) ||
    ids;

  if (showQuiz) {
    let questionsResult;
    if (ids) {
      const questionIds = ids.split(",").filter(Boolean);
      questionsResult = await getQuestionsByIds(questionIds, { locale });
    } else {
      questionsResult = await getQuestionsForPractice(certId, {
        mode: mode === "category" ? "category" : "all",
        categoryId: category ?? undefined,
        locale,
      });
    }

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
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <PracticeEntry data={entryData} />
        </div>
      </main>
      <Footer />
    </>
  );
}
