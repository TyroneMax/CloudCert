import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCertifications } from "@/lib/data/certifications";
import { CertificationsClient } from "./certifications-client";

export const metadata = {
  title: "Certifications",
  description: "Browse AWS, Azure, and GCP certification question banks.",
};

export default async function CertificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string }>;
}) {
  const { locale } = await params;
  const { provider } = await searchParams;

  const certs = await getCertifications({
    locale,
    provider: provider as "AWS" | "Azure" | "GCP" | undefined,
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted h-64" />}>
            <CertificationsClient certs={certs} locale={locale} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
