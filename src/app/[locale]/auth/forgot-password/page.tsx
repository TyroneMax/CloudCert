"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Cloud, Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/${locale}/auth/reset-password`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <MailCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">{t("checkEmail")}</h1>
          <p className="mt-3 text-muted-foreground">{t("checkEmailResetDesc")}</p>
          <Link
            href={`/${locale}/auth/login`}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2" aria-label="CloudCert Home">
            <Cloud className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold tracking-tight">CloudCert</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">{t("forgotPasswordTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("forgotPasswordSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("sendResetLink")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("rememberPassword")}{" "}
            <Link href={`/${locale}/auth/login`} className="font-medium text-blue-600 hover:text-blue-800">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
