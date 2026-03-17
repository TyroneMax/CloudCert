/**
 * Certifications data layer.
 * Fetches from Supabase with optional translation and progress.
 */

import { createClient } from "@/lib/supabase/server";

export type Certification = {
  id: string;
  code: string;
  name: string;
  provider: "AWS" | "Azure" | "GCP";
  description: string | null;
  icon_url: string | null;
  total_questions: number;
  free_question_limit: number;
  is_active: boolean;
  name_translated?: string;
};

export type CertificationWithProgress = Certification & {
  answered_count: number;
};

export async function getCertifications(options?: {
  locale?: string;
  provider?: "AWS" | "Azure" | "GCP" | "all";
  userId?: string | null;
}): Promise<CertificationWithProgress[]> {
  const supabase = await createClient();
  const { provider = "all", locale = "en", userId } = options ?? {};

  const { data: certs, error } = await supabase
    .from("certifications")
    .select("id, code, name, provider, description, icon_url, total_questions, free_question_limit, is_active")
    .eq("is_active", true)
    .order("total_questions", { ascending: false });

  if (error || !certs) {
    return [];
  }

  let filtered = certs;
  if (provider !== "all") {
    filtered = certs.filter((c) => c.provider === provider);
  }

  // Fetch translations for locale if not en
  const lang = locale === "en" ? null : locale;
  let translations: Record<string, string> = {};
  if (lang && filtered.length > 0) {
    const { data: trans } = await supabase
      .from("certification_translations")
      .select("certification_id, name")
      .eq("language", lang)
      .in("certification_id", filtered.map((c) => c.id));
    if (trans) {
      trans.forEach((t) => {
        translations[t.certification_id] = t.name;
      });
    }
  }

  // Fetch answered count per cert when userId present
  let progressMap: Record<string, number> = {};
  if (userId && filtered.length > 0) {
    const certIds = filtered.map((c) => c.id);
    const { data: questions } = await supabase
      .from("questions")
      .select("id, certification_id")
      .in("certification_id", certIds);
    if (questions && questions.length > 0) {
      const qIds = questions.map((q) => q.id);
      const { data: attempts } = await supabase
        .from("user_attempts")
        .select("question_id")
        .eq("user_id", userId)
        .in("question_id", qIds);
      if (attempts) {
        const distinctByCert: Record<string, Set<string>> = {};
        attempts.forEach((a) => {
          const q = questions.find((q) => q.id === a.question_id);
          if (q) {
            if (!distinctByCert[q.certification_id]) distinctByCert[q.certification_id] = new Set();
            distinctByCert[q.certification_id].add(a.question_id);
          }
        });
        Object.entries(distinctByCert).forEach(([certId, set]) => {
          progressMap[certId] = set.size;
        });
      }
    }
  }

  return filtered.map((c) => ({
    id: c.id,
    code: c.code,
    name: lang && translations[c.id] ? translations[c.id] : c.name,
    provider: c.provider as "AWS" | "Azure" | "GCP",
    description: c.description,
    icon_url: c.icon_url,
    total_questions: c.total_questions,
    free_question_limit: c.free_question_limit,
    is_active: c.is_active,
    answered_count: progressMap[c.id] ?? 0,
  }));
}

export async function getCertificationByCode(
  code: string,
  options?: { locale?: string }
): Promise<Certification | null> {
  const supabase = await createClient();
  const { locale = "en" } = options ?? {};

  const { data: cert, error } = await supabase
    .from("certifications")
    .select("id, code, name, provider, description, icon_url, total_questions, free_question_limit, is_active")
    .eq("code", code)
    .single();

  if (error || !cert) return null;

  let name = cert.name;
  if (locale !== "en") {
    const { data: trans } = await supabase
      .from("certification_translations")
      .select("name")
      .eq("certification_id", cert.id)
      .eq("language", locale)
      .single();
    if (trans) name = trans.name;
  }

  return {
    id: cert.id,
    code: cert.code,
    name,
    provider: cert.provider as "AWS" | "Azure" | "GCP",
    description: cert.description,
    icon_url: cert.icon_url,
    total_questions: cert.total_questions,
    free_question_limit: cert.free_question_limit,
    is_active: cert.is_active,
  };
}
