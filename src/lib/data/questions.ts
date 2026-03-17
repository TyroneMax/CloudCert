/**
 * Questions data layer for practice/quiz.
 * Fetches from Supabase. Options exclude is_correct (server-side validation only).
 */

import { createClient } from "@/lib/supabase/server";

export type QuestionOption = {
  id: string;
  option_label: string;
  option_text: string;
  sort_order: number;
};

export type Question = {
  id: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice";
  category_name: string;
  category_id: string;
  sort_order: number;
  is_free: boolean;
  options: QuestionOption[];
};

export type QuestionsResult = {
  questions: Question[];
  total: number;
};

export async function getQuestionsForPractice(
  certCode: string,
  options?: {
    mode?: "all" | "category";
    categoryId?: string;
    locale?: string;
  }
): Promise<QuestionsResult | null> {
  const supabase = await createClient();
  const { mode = "all", categoryId, locale = "en" } = options ?? {};

  const { data: cert, error: certError } = await supabase
    .from("certifications")
    .select("id")
    .eq("code", certCode)
    .eq("is_active", true)
    .single();

  if (certError || !cert) return null;

  let query = supabase
    .from("questions")
    .select("id, question_text, question_type, category_id, sort_order, is_free")
    .eq("certification_id", cert.id)
    .eq("status", "published")
    .order("sort_order");

  if (mode === "category" && categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: questions, error } = await query;

  if (error || !questions || questions.length === 0) return null;

  const categoryIds = [...new Set(questions.map((q) => q.category_id))];
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);

  const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  if (locale !== "en") {
    const { data: ct } = await supabase
      .from("category_translations")
      .select("category_id, name")
      .in("category_id", categoryIds)
      .eq("language", locale);
    ct?.forEach((t) => catMap.set(t.category_id, t.name));
  }

  const result: Question[] = [];
  for (const q of questions) {
    const { data: opts } = await supabase
      .from("options")
      .select("id, option_label, option_text, sort_order")
      .eq("question_id", q.id)
      .order("sort_order");

    let questionText = q.question_text;
    if (locale !== "en") {
      const { data: qt } = await supabase
        .from("question_translations")
        .select("question_text")
        .eq("question_id", q.id)
        .eq("language", locale)
        .single();
      if (qt) questionText = qt.question_text;
    }

    const options: QuestionOption[] = (opts ?? []).map((o) => ({
      id: o.id,
      option_label: o.option_label,
      option_text: o.option_text,
      sort_order: o.sort_order,
    }));

    let optionTexts = options;
    if (locale !== "en" && options.length > 0) {
      const { data: ot } = await supabase
        .from("option_translations")
        .select("option_id, option_text")
        .in("option_id", options.map((o) => o.id))
        .eq("language", locale);
      if (ot) {
        const otMap = new Map(ot.map((t) => [t.option_id, t.option_text]));
        optionTexts = options.map((o) => ({
          ...o,
          option_text: otMap.get(o.id) ?? o.option_text,
        }));
      }
    }

    result.push({
      id: q.id,
      question_text: questionText,
      question_type: q.question_type as "single_choice" | "multiple_choice",
      category_name: catMap.get(q.category_id) ?? "Unknown",
      category_id: q.category_id,
      sort_order: q.sort_order,
      is_free: q.is_free,
      options: optionTexts,
    });
  }

  result.sort((a, b) => a.sort_order - b.sort_order);

  return {
    questions: result,
    total: result.length,
  };
}

export async function getQuestionsByIds(
  questionIds: string[],
  options?: { locale?: string }
): Promise<QuestionsResult | null> {
  if (questionIds.length === 0) return null;

  const supabase = await createClient();
  const { locale = "en" } = options ?? {};

  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, question_text, question_type, category_id, sort_order, is_free, certification_id")
    .in("id", questionIds)
    .eq("status", "published");

  if (error || !questions || questions.length === 0) return null;

  const categoryIds = [...new Set(questions.map((q) => q.category_id))];
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);

  const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  if (locale !== "en") {
    const { data: ct } = await supabase
      .from("category_translations")
      .select("category_id, name")
      .in("category_id", categoryIds)
      .eq("language", locale);
    ct?.forEach((t) => catMap.set(t.category_id, t.name));
  }

  const orderMap = new Map(questionIds.map((id, i) => [id, i]));
  const result: Question[] = [];

  for (const q of questions) {
    const { data: opts } = await supabase
      .from("options")
      .select("id, option_label, option_text, sort_order")
      .eq("question_id", q.id)
      .order("sort_order");

    let questionText = q.question_text;
    if (locale !== "en") {
      const { data: qt } = await supabase
        .from("question_translations")
        .select("question_text")
        .eq("question_id", q.id)
        .eq("language", locale)
        .single();
      if (qt) questionText = qt.question_text;
    }

    const options: QuestionOption[] = (opts ?? []).map((o) => ({
      id: o.id,
      option_label: o.option_label,
      option_text: o.option_text,
      sort_order: o.sort_order,
    }));

    let optionTexts = options;
    if (locale !== "en" && options.length > 0) {
      const { data: ot } = await supabase
        .from("option_translations")
        .select("option_id, option_text")
        .in("option_id", options.map((o) => o.id))
        .eq("language", locale);
      if (ot) {
        const otMap = new Map(ot.map((t) => [t.option_id, t.option_text]));
        optionTexts = options.map((o) => ({
          ...o,
          option_text: otMap.get(o.id) ?? o.option_text,
        }));
      }
    }

    result.push({
      id: q.id,
      question_text: questionText,
      question_type: q.question_type as "single_choice" | "multiple_choice",
      category_name: catMap.get(q.category_id) ?? "Unknown",
      category_id: q.category_id,
      sort_order: orderMap.get(q.id) ?? q.sort_order,
      is_free: q.is_free,
      options: optionTexts,
    });
  }

  result.sort((a, b) => a.sort_order - b.sort_order);

  return {
    questions: result,
    total: result.length,
  };
}
