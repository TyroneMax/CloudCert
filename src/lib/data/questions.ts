/**
 * Questions data layer for practice/quiz.
 * Includes correctOptionIds for client UX (study mode, auto-submit). Server still validates on submit.
 * Supports bilingual bundles: English + preferred question language.
 */

import { createClient } from "@/lib/supabase/server";

export type QuestionOption = {
  id: string;
  option_label: string;
  option_text: string;
  sort_order: number;
};

/** One locale slice (stem, category label, options text, explanation). */
export type LocalizedQuestionSlice = {
  question_text: string;
  category_name: string;
  options: QuestionOption[];
  explanation: string;
};

export type Question = {
  id: string;
  /** Preferred locale copy (same as contentByLocale[defaultContentLocale]) */
  question_text: string;
  question_type: "single_choice" | "multiple_choice";
  category_name: string;
  category_id: string;
  sort_order: number;
  is_free: boolean;
  options: QuestionOption[];
  /** From DB options.is_correct; used for study mode & auto-eval (submit-answer still authoritative). */
  correctOptionIds: string[];
  contentByLocale: Record<string, LocalizedQuestionSlice>;
  defaultContentLocale: string;
};

export type QuestionsResult = {
  questions: Question[];
  total: number;
};

type RawQ = {
  id: string;
  question_text: string;
  explanation: string | null;
  question_type: string;
  category_id: string;
  sort_order: number;
  is_free: boolean;
};

function uniqueLangs(preferred: string): string[] {
  const p = preferred === "en" ? "en" : preferred;
  return p === "en" ? ["en"] : ["en", p];
}

async function buildQuestionsFromRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rawQuestions: RawQ[],
  preferredLocale: string,
  orderMap: Map<string, number> | null
): Promise<Question[]> {
  if (rawQuestions.length === 0) return [];

  const langs = uniqueLangs(preferredLocale);
  const questionIds = rawQuestions.map((q) => q.id);
  const categoryIds = [...new Set(rawQuestions.map((q) => q.category_id))];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);

  const catEn = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const { data: catTr } = await supabase
    .from("category_translations")
    .select("category_id, language, name")
    .in("category_id", categoryIds)
    .in("language", langs.filter((l) => l !== "en"));

  const catLocalized = new Map<string, string>();
  catTr?.forEach((row) => {
    catLocalized.set(`${row.category_id}_${row.language}`, row.name);
  });

  function categoryName(catId: string, lang: string): string {
    const base = catEn.get(catId) ?? "Unknown";
    if (lang === "en") return base;
    return catLocalized.get(`${catId}_${lang}`) ?? base;
  }

  const { data: allOpts } = await supabase
    .from("options")
    .select("id, question_id, option_label, option_text, sort_order, is_correct")
    .in("question_id", questionIds)
    .order("sort_order");

  const optsByQ = new Map<string, typeof allOpts>();
  for (const o of allOpts ?? []) {
    const qid = o.question_id as string;
    const arr = optsByQ.get(qid) ?? [];
    arr.push(o);
    optsByQ.set(qid, arr);
  }

  const allOptionIds = (allOpts ?? []).map((o) => o.id as string);

  const { data: qTranslations } = await supabase
    .from("question_translations")
    .select("question_id, language, question_text, explanation")
    .in("question_id", questionIds)
    .in("language", langs.filter((l) => l !== "en"));

  const qtMap = new Map<string, { question_text: string; explanation: string | null }>();
  qTranslations?.forEach((row) => {
    qtMap.set(`${row.question_id}_${row.language}`, {
      question_text: row.question_text,
      explanation: row.explanation,
    });
  });

  let otMap = new Map<string, string>();
  if (allOptionIds.length > 0 && langs.some((l) => l !== "en")) {
    const { data: oTranslations } = await supabase
      .from("option_translations")
      .select("option_id, language, option_text")
      .in("option_id", allOptionIds)
      .in("language", langs.filter((l) => l !== "en"));
    oTranslations?.forEach((row) => {
      otMap.set(`${row.option_id}_${row.language}`, row.option_text);
    });
  }

  const result: Question[] = [];

  for (const q of rawQuestions) {
    const baseOpts = (optsByQ.get(q.id) ?? []).map((o) => ({
      id: o.id as string,
      option_label: o.option_label as string,
      option_text: o.option_text as string,
      sort_order: o.sort_order as number,
    }));

    const contentByLocale: Record<string, LocalizedQuestionSlice> = {};

    for (const lang of langs) {
      const qt = lang === "en" ? null : qtMap.get(`${q.id}_${lang}`);
      const questionText =
        lang === "en" ? q.question_text : (qt?.question_text ?? q.question_text);
      const explanation =
        lang === "en"
          ? (q.explanation ?? "")
          : (qt?.explanation ?? q.explanation ?? "");

      const options: QuestionOption[] = baseOpts.map((o) => ({
        ...o,
        option_text:
          lang === "en"
            ? o.option_text
            : (otMap.get(`${o.id}_${lang}`) ?? o.option_text),
      }));

      contentByLocale[lang] = {
        question_text: questionText,
        category_name: categoryName(q.category_id, lang),
        options,
        explanation,
      };
    }

    const def = preferredLocale in contentByLocale ? preferredLocale : "en";
    const primary = contentByLocale[def] ?? contentByLocale.en;

    const sortVal = orderMap?.get(q.id) ?? q.sort_order;

    const baseRows = optsByQ.get(q.id) ?? [];
    const correctOptionIds = baseRows
      .filter((o) => o.is_correct === true)
      .map((o) => o.id as string)
      .sort();

    result.push({
      id: q.id,
      question_text: primary.question_text,
      question_type: q.question_type as "single_choice" | "multiple_choice",
      category_name: primary.category_name,
      category_id: q.category_id,
      sort_order: sortVal,
      is_free: q.is_free,
      options: primary.options,
      correctOptionIds,
      contentByLocale,
      defaultContentLocale: def,
    });
  }

  result.sort((a, b) => a.sort_order - b.sort_order);
  return result;
}

export async function getQuestionsForPractice(
  certCode: string,
  options?: {
    mode?: "all" | "category";
    categoryId?: string;
    /** Preferred language for question content (UI locale or user_preferences.question_language). */
    questionLanguage?: string;
  }
): Promise<QuestionsResult | null> {
  const supabase = await createClient();
  const { mode = "all", categoryId, questionLanguage = "en" } = options ?? {};

  const { data: cert, error: certError } = await supabase
    .from("certifications")
    .select("id")
    .eq("code", certCode)
    .eq("is_active", true)
    .single();

  if (certError || !cert) return null;

  let query = supabase
    .from("questions")
    .select(
      "id, question_text, explanation, question_type, category_id, sort_order, is_free"
    )
    .eq("certification_id", cert.id)
    .eq("status", "published")
    .order("sort_order");

  if (mode === "category" && categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: questions, error } = await query;

  if (error || !questions || questions.length === 0) return null;

  const raw = questions as RawQ[];
  const built = await buildQuestionsFromRows(supabase, raw, questionLanguage, null);

  return {
    questions: built,
    total: built.length,
  };
}

export async function getQuestionsByIds(
  questionIds: string[],
  options?: { questionLanguage?: string }
): Promise<QuestionsResult | null> {
  if (questionIds.length === 0) return null;

  const supabase = await createClient();
  const { questionLanguage = "en" } = options ?? {};

  const { data: questions, error } = await supabase
    .from("questions")
    .select(
      "id, question_text, explanation, question_type, category_id, sort_order, is_free, certification_id"
    )
    .in("id", questionIds)
    .eq("status", "published");

  if (error || !questions || questions.length === 0) return null;

  const orderMap = new Map(questionIds.map((id, i) => [id, i]));
  const raw = questions as RawQ[];
  const built = await buildQuestionsFromRows(supabase, raw, questionLanguage, orderMap);

  return {
    questions: built,
    total: built.length,
  };
}
