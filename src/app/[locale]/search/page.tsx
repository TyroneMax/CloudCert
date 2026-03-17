import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { search } from "@/lib/data/search";
import { SearchClient } from "./search-client";

export const metadata = {
  title: "Search",
  description: "Search questions and certifications.",
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { q, type } = await searchParams;

  const results = q && q.trim().length >= 2
    ? await search(q.trim(), {
        type: (type as "all" | "questions" | "certifications") ?? "all",
        locale,
      })
    : { certifications: [], questions: [] };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
          <SearchClient
            initialQuery={q ?? ""}
            initialType={(type as "all" | "questions" | "certifications") ?? "all"}
            results={results}
            locale={locale}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
