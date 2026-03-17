import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RoadmapClient } from "./roadmap-client";

export const metadata = {
  title: "Product Roadmap",
  description: "See what's coming next for CloudCert. AWS, Azure, GCP certification practice roadmap.",
};

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
          <RoadmapClient locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
