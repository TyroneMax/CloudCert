/**
 * Practice entry data layer.
 * Fetches from Supabase.
 */

import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  sort_order: number;
  question_count: number;
  answered_count: number;
};

export type PracticeEntryData = {
  certification: {
    id: string;
    code: string;
    name: string;
    provider: string;
    total_questions: number;
    free_question_limit: number;
  };
  stats: {
    answered_count: number;
    correct_count: number;
    wrong_count: number;
    correct_rate: number;
  };
  last_question_sort_order: number | null;
  categories: Category[];
};

export async function getPracticeEntryData(
  certCode: string,
  options?: { locale?: string; userId?: string | null }
): Promise<PracticeEntryData | null> {
  const supabase = await createClient();
  const { locale = "en", userId } = options ?? {};

  const { data: cert, error: certError } = await supabase
    .from("certifications")
    .select("id, code, name, provider, total_questions, free_question_limit")
    .eq("code", certCode)
    .eq("is_active", true)
    .single();

  if (certError || !cert) return null;

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

  // Categories with question counts
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .eq("certification_id", cert.id)
    .order("sort_order");

  const catList: Category[] = [];
  if (categories) {
    for (const cat of categories) {
      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("status", "published");
      let answeredCount = 0;
      if (userId && (count ?? 0) > 0) {
        const { data: qs } = await supabase
          .from("questions")
          .select("id")
          .eq("category_id", cat.id)
          .eq("status", "published");
        if (qs && qs.length > 0) {
          const { data: attempts } = await supabase
            .from("user_attempts")
            .select("question_id")
            .eq("user_id", userId)
            .in("question_id", qs.map((q) => q.id));
          const distinctQuestions = new Set((attempts ?? []).map((a) => a.question_id));
          answeredCount = distinctQuestions.size;
        }
      }
      let catName = cat.name;
      if (locale !== "en") {
        const { data: ct } = await supabase
          .from("category_translations")
          .select("name")
          .eq("category_id", cat.id)
          .eq("language", locale)
          .single();
        if (ct) catName = ct.name;
      }
      catList.push({
        id: cat.id,
        name: catName,
        sort_order: cat.sort_order,
        question_count: count ?? 0,
        answered_count: answeredCount,
      });
    }
  }

  // Stats (when userId present)
  let stats = { answered_count: 0, correct_count: 0, wrong_count: 0, correct_rate: 0 };
  let lastSortOrder: number | null = null;

  if (userId) {
    const { data: certQuestions } = await supabase
      .from("questions")
      .select("id, sort_order")
      .eq("certification_id", cert.id)
      .eq("status", "published");

    if (certQuestions && certQuestions.length > 0) {
      const qIds = certQuestions.map((q) => q.id);
      const { data: attempts } = await supabase
        .from("user_attempts")
        .select("question_id, is_correct, attempted_at")
        .eq("user_id", userId)
        .in("question_id", qIds)
        .order("attempted_at", { ascending: false });

      if (attempts && attempts.length > 0) {
        const latestByQuestion = new Map<string, boolean>();
        attempts.forEach((a) => {
          if (!latestByQuestion.has(a.question_id)) {
            latestByQuestion.set(a.question_id, a.is_correct);
          }
        });

        let correctCount = 0;
        let maxSort = 0;
        certQuestions.forEach((q) => {
          const isCorrect = latestByQuestion.get(q.id);
          if (isCorrect !== undefined) {
            if (isCorrect) correctCount++;
            maxSort = Math.max(maxSort, q.sort_order);
          }
        });
        const total = latestByQuestion.size;
        stats = {
          answered_count: total,
          correct_count: correctCount,
          wrong_count: total - correctCount,
          correct_rate: total > 0 ? Math.round((correctCount / total) * 1000) / 10 : 0,
        };
        lastSortOrder = maxSort > 0 ? maxSort : null;
      }
    }
  }

  return {
    certification: {
      id: cert.id,
      code: cert.code,
      name,
      provider: cert.provider,
      total_questions: cert.total_questions,
      free_question_limit: cert.free_question_limit,
    },
    stats,
    last_question_sort_order: lastSortOrder,
    categories: catList,
  };
}
