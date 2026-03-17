/**
 * Wrong answers data layer.
 * Fetches questions where user's latest attempt is incorrect.
 */

import { createClient } from "@/lib/supabase/server";

export type WrongAnswerItem = {
  question_id: string;
  certification_id: string;
  certification_name: string;
  certification_code: string;
  category_id: string;
  category_name: string;
  question_text: string;
  selected_option_ids: string[];
  correct_option_ids: string[];
  selected_option_labels: string[];
  correct_option_labels: string[];
  explanation: string;
  attempt_count: number;
  last_attempted_at: string;
};

export type WrongAnswersResult = {
  items: WrongAnswerItem[];
  total: number;
};

export async function getWrongAnswers(
  userId: string,
  options?: {
    certCode?: string;
    categoryId?: string;
    locale?: string;
    limit?: number;
    offset?: number;
  }
): Promise<WrongAnswersResult> {
  const supabase = await createClient();
  const { certCode, categoryId, locale = "en", limit = 50, offset = 0 } = options ?? {};

  const { data: attempts } = await supabase
    .from("user_attempts")
    .select("question_id, selected_option_ids, is_correct, attempted_at")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (!attempts || attempts.length === 0) {
    return { items: [], total: 0 };
  }

  const latestByQuestion = new Map<string, { selected_option_ids: string[]; is_correct: boolean; attempted_at: string }>();
  attempts.forEach((a) => {
    if (!latestByQuestion.has(a.question_id)) {
      latestByQuestion.set(a.question_id, {
        selected_option_ids: a.selected_option_ids,
        is_correct: a.is_correct,
        attempted_at: a.attempted_at,
      });
    }
  });

  const wrongQuestionIds = [...latestByQuestion.entries()]
    .filter(([, v]) => !v.is_correct)
    .map(([qId]) => qId);

  if (wrongQuestionIds.length === 0) {
    return { items: [], total: 0 };
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, explanation, certification_id, category_id")
    .in("id", wrongQuestionIds)
    .eq("status", "published");

  if (!questions || questions.length === 0) {
    return { items: [], total: 0 };
  }

  let filtered = questions;
  if (certCode) {
    const { data: cert } = await supabase
      .from("certifications")
      .select("id")
      .eq("code", certCode)
      .single();
    if (cert) {
      filtered = questions.filter((q) => q.certification_id === cert.id);
    }
  }
  if (categoryId) {
    filtered = filtered.filter((q) => q.category_id === categoryId);
  }

  const certIds = [...new Set(filtered.map((q) => q.certification_id))];
  const catIds = [...new Set(filtered.map((q) => q.category_id))];

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

  const items: WrongAnswerItem[] = [];
  for (const q of filtered) {
    const latest = latestByQuestion.get(q.id);
    if (!latest) continue;

    const { data: opts } = await supabase
      .from("options")
      .select("id, is_correct, option_label, option_text")
      .eq("question_id", q.id);
    const correctOptionIds = (opts ?? []).filter((o) => o.is_correct).map((o) => o.id);
    const optMap = new Map((opts ?? []).map((o) => [o.id, o]));
    const selectedOptionLabels = (latest.selected_option_ids ?? [])
      .map((id) => optMap.get(id))
      .filter(Boolean)
      .map((o) => `${o!.option_label}. ${o!.option_text}`);
    const correctOptionLabels = correctOptionIds
      .map((id) => optMap.get(id))
      .filter(Boolean)
      .map((o) => `${o!.option_label}. ${o!.option_text}`);

    let questionText = q.question_text;
    let explanation = q.explanation ?? "";
    if (locale !== "en") {
      const { data: qt } = await supabase
        .from("question_translations")
        .select("question_text, explanation")
        .eq("question_id", q.id)
        .eq("language", locale)
        .single();
      if (qt) {
        questionText = qt.question_text;
        if (qt.explanation) explanation = qt.explanation;
      }
    }

    const attemptCount = attempts.filter((a) => a.question_id === q.id).length;
    const cert = certMap.get(q.certification_id);

    items.push({
      question_id: q.id,
      certification_id: q.certification_id,
      certification_name: cert?.name ?? "Unknown",
      certification_code: cert?.code ?? "",
      category_id: q.category_id,
      category_name: catMap.get(q.category_id) ?? "Unknown",
      question_text: questionText,
      selected_option_ids: latest.selected_option_ids,
      correct_option_ids: correctOptionIds,
      selected_option_labels: selectedOptionLabels,
      correct_option_labels: correctOptionLabels,
      explanation,
      attempt_count: attemptCount,
      last_attempted_at: latest.attempted_at,
    });
  }

  items.sort((a, b) => new Date(b.last_attempted_at).getTime() - new Date(a.last_attempted_at).getTime());

  const total = items.length;
  const paginated = items.slice(offset, offset + limit);

  return {
    items: paginated,
    total,
  };
}
