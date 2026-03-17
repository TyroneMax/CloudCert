/**
 * Search data layer.
 * Searches certifications and questions by keyword.
 */

import { createClient } from "@/lib/supabase/server";

export type SearchCertResult = {
  id: string;
  code: string;
  name: string;
  provider: string;
  total_questions: number;
};

export type SearchQuestionResult = {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  cert_name: string;
  cert_code: string;
  category_name: string;
};

export type SearchResult = {
  certifications: SearchCertResult[];
  questions: SearchQuestionResult[];
};

export async function search(
  query: string,
  options?: {
    type?: "all" | "questions" | "certifications";
    locale?: string;
    limit?: number;
  }
): Promise<SearchResult> {
  const supabase = await createClient();
  const { type = "all", locale = "en", limit = 20 } = options ?? {};

  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) {
    return { certifications: [], questions: [] };
  }

  const certPattern = `%${q}%`;
  const questionPattern = `%${q}%`;

  const result: SearchResult = { certifications: [], questions: [] };

  if (type === "all" || type === "certifications") {
    const { data: byName } = await supabase
      .from("certifications")
      .select("id, code, name, provider, total_questions")
      .eq("is_active", true)
      .ilike("name", certPattern)
      .limit(limit);
    const { data: byCode } = await supabase
      .from("certifications")
      .select("id, code, name, provider, total_questions")
      .eq("is_active", true)
      .ilike("code", certPattern)
      .limit(limit);
    const seen = new Set<string>();
    const certs = [...(byName ?? []), ...(byCode ?? [])].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    }).slice(0, limit);

    if (certs) {
      const certIds = certs.map((c) => c.id);
      let nameMap = new Map(certs.map((c) => [c.id, c.name]));
      if (locale !== "en" && certIds.length > 0) {
        const { data: trans } = await supabase
          .from("certification_translations")
          .select("certification_id, name")
          .in("certification_id", certIds)
          .eq("language", locale);
        trans?.forEach((t) => nameMap.set(t.certification_id, t.name));
      }
      result.certifications = certs.map((c) => ({
        id: c.id,
        code: c.code,
        name: nameMap.get(c.id) ?? c.name,
        provider: c.provider,
        total_questions: c.total_questions,
      }));
    }
  }

  if (type === "all" || type === "questions") {
    let questionIds: string[] = [];

    if (locale === "en") {
      const { data: qs } = await supabase
        .from("questions")
        .select("id")
        .eq("status", "published")
        .ilike("question_text", questionPattern)
        .limit(limit);
      questionIds = (qs ?? []).map((q) => q.id);
    } else {
      const { data: qTrans } = await supabase
        .from("question_translations")
        .select("question_id")
        .eq("language", locale)
        .ilike("question_text", questionPattern)
        .limit(limit);
      questionIds = [...new Set((qTrans ?? []).map((t) => t.question_id))];
    }

    if (questionIds.length > 0) {
      const { data: questions } = await supabase
        .from("questions")
        .select("id, question_text, question_type, difficulty, certification_id, category_id")
        .in("id", questionIds)
        .eq("status", "published");

      if (questions && questions.length > 0) {
        const certIds = [...new Set(questions.map((q) => q.certification_id))];
        const catIds = [...new Set(questions.map((q) => q.category_id))];

        const { data: certs } = await supabase
          .from("certifications")
          .select("id, code, name")
          .in("id", certIds);
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", catIds);

        const certMap = new Map((certs ?? []).map((c) => [c.id, { code: c.code, name: c.name }]));
        const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));

        if (locale !== "en") {
          const { data: ct } = await supabase
            .from("certification_translations")
            .select("certification_id, name")
            .in("certification_id", certIds)
            .eq("language", locale);
          ct?.forEach((t) => {
            const c = certMap.get(t.certification_id);
            if (c) certMap.set(t.certification_id, { ...c, name: t.name });
          });
          const { data: catTrans } = await supabase
            .from("category_translations")
            .select("category_id, name")
            .in("category_id", catIds)
            .eq("language", locale);
          catTrans?.forEach((t) => catMap.set(t.category_id, t.name));
        }

        let questionTextMap = new Map(questions.map((q) => [q.id, q.question_text]));
        if (locale !== "en") {
          const { data: qt } = await supabase
            .from("question_translations")
            .select("question_id, question_text")
            .in("question_id", questionIds)
            .eq("language", locale);
          qt?.forEach((t) => questionTextMap.set(t.question_id, t.question_text));
        }

        result.questions = questions.map((q) => {
          const cert = certMap.get(q.certification_id);
          return {
            id: q.id,
            question_text: questionTextMap.get(q.id) ?? q.question_text,
            question_type: q.question_type,
            difficulty: q.difficulty,
            cert_name: cert?.name ?? "Unknown",
            cert_code: cert?.code ?? "",
            category_name: catMap.get(q.category_id) ?? "Unknown",
          };
        });
      }
    }
  }

  return result;
}
