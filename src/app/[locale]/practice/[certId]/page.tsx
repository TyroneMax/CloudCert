import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPracticeEntryData } from "@/lib/data/practice";
import { getQuestionsForPractice } from "@/lib/data/questions";
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
  };
}

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ certId: string; locale: string }>;
  searchParams: Promise<{ start?: string; mode?: string; category?: string }>;
}) {
  const { certId } = await params;
  const { start, mode, category } = await searchParams;

  const entryData = await getPracticeEntryData(certId);
  if (!entryData) notFound();

  const showQuiz =
    start ||
    (mode === "category" && category);

  if (showQuiz) {
    const questionsResult = await getQuestionsForPractice(certId, {
      mode: mode === "category" ? "category" : "all",
      categoryId: category ?? undefined,
    });

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
