import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import {
  Plus_Jakarta_Sans,
  Noto_Sans_SC,
  Zen_Kaku_Gothic_New,
  Gothic_A1,
  JetBrains_Mono,
} from "next/font/google";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import "../globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
  preload: false,
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku",
  preload: false,
});

const gothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gothic-a1",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const localeFontMap: Record<string, typeof plusJakartaSans> = {
  en: plusJakartaSans,
  zh: notoSansSC,
  ja: zenKakuGothicNew,
  ko: gothicA1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cloudcert.com"),
  title: {
    default: "CloudCert - Pass Your Cloud Certification with Confidence",
    template: "%s | CloudCert",
  },
  description:
    "Practice for AWS, Azure, and GCP certification exams with multi-language question banks, detailed explanations, and progress tracking.",
  keywords: [
    "cloud certification",
    "AWS",
    "Azure",
    "GCP",
    "practice exam",
    "certification preparation",
  ],
  openGraph: {
    type: "website",
    siteName: "CloudCert",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  const localeFont = localeFontMap[locale] || plusJakartaSans;

  return (
    <html
      lang={locale}
      className={cn(localeFont.variable, jetbrainsMono.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ScrollToTop />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
