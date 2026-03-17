/**
 * Dashboard data layer.
 * Fetches user stats, certifications progress, category breakdown, recent activity.
 */

import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalAnswered: number;
  correctRate: number;
  wrongCount: number;
};

export type CertProgress = {
  id: string;
  code: string;
  name: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  wrong_count: number;
  correct_rate: number;
};

export type CategoryBreakdown = {
  name: string;
  correct: number;
  total: number;
  rate: number;
};

export type RecentActivity = {
  date: string;
  question_count: number;
  cert_name: string;
};

export type DashboardData = {
  stats: DashboardStats;
  certProgress: CertProgress[];
  categoryBreakdown: CategoryBreakdown[];
  recentActivity: RecentActivity[];
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const stats: DashboardStats = { totalAnswered: 0, correctRate: 0, wrongCount: 0 };
  const certProgress: CertProgress[] = [];
  const categoryBreakdown: CategoryBreakdown[] = [];
  const recentActivity: RecentActivity[] = [];

  const { data: attempts } = await supabase
    .from("user_attempts")
    .select("question_id, is_correct, attempted_at")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (!attempts || attempts.length === 0) {
    const { data: certs } = await supabase
      .from("certifications")
      .select("id, code, name, total_questions")
      .eq("is_active", true);
    return {
      stats,
      certProgress: (certs ?? []).map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        total_questions: c.total_questions,
        answered_count: 0,
        correct_count: 0,
        wrong_count: 0,
        correct_rate: 0,
      })),
      categoryBreakdown: [],
      recentActivity: [],
    };
  }

  const latestByQuestion = new Map<string, boolean>();
  attempts.forEach((a) => {
    if (!latestByQuestion.has(a.question_id)) {
      latestByQuestion.set(a.question_id, a.is_correct);
    }
  });

  const questionIds = [...latestByQuestion.keys()];
  const latestValues = [...latestByQuestion.values()];
  stats.totalAnswered = questionIds.length;
  stats.correctRate =
    latestValues.length > 0
      ? Math.round((latestValues.filter(Boolean).length / latestValues.length) * 1000) / 10
      : 0;
  stats.wrongCount = latestValues.filter((v) => !v).length;

  const { data: questions } = await supabase
    .from("questions")
    .select("id, certification_id, category_id")
    .in("id", questionIds);

  if (questions) {
    const certIds = [...new Set(questions.map((q) => q.certification_id))];
    const { data: certs } = await supabase
      .from("certifications")
      .select("id, code, name, total_questions")
      .in("id", certIds)
      .eq("is_active", true);

    if (certs) {
      for (const cert of certs) {
        const certQuestions = questions.filter((q) => q.certification_id === cert.id);
        const certQuestionIds = certQuestions.map((q) => q.id);
        const certLatest = certQuestionIds
          .map((qId) => latestByQuestion.get(qId))
          .filter((v): v is boolean => v !== undefined);
        const correctCount = certLatest.filter(Boolean).length;
        certProgress.push({
          id: cert.id,
          code: cert.code,
          name: cert.name,
          total_questions: cert.total_questions,
          answered_count: certQuestionIds.length,
          correct_count: correctCount,
          wrong_count: certQuestionIds.length - correctCount,
          correct_rate:
            certQuestionIds.length > 0
              ? Math.round((correctCount / certQuestionIds.length) * 1000) / 10
              : 0,
        });
      }
    }

    const activeCertId = certProgress[0]?.id ?? certs?.[0]?.id;
    if (activeCertId) {
      const certQuestions = questions.filter((q) => q.certification_id === activeCertId);
      const categoryIds = [...new Set(certQuestions.map((q) => q.category_id))];
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, sort_order")
        .in("id", categoryIds)
        .order("sort_order");

      if (categories) {
        for (const cat of categories) {
          const catQuestions = certQuestions.filter((q) => q.category_id === cat.id);
          const catQuestionIds = catQuestions.map((q) => q.id);
          const catLatest = catQuestionIds
            .map((qId) => latestByQuestion.get(qId))
            .filter((v): v is boolean => v !== undefined);
          const correct = catLatest.filter(Boolean).length;
          const total = catQuestionIds.length;
          categoryBreakdown.push({
            name: cat.name,
            correct,
            total,
            rate: total > 0 ? Math.round((correct / total) * 100) : 0,
          });
        }
        categoryBreakdown.sort((a, b) => {
          const aIdx = categories.findIndex((c) => c.name === a.name);
          const bIdx = categories.findIndex((c) => c.name === b.name);
          return aIdx - bIdx;
        });
      }
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentAttempts = attempts.filter(
    (a) => new Date(a.attempted_at) >= sevenDaysAgo
  );

  if (recentAttempts.length > 0) {
    const { data: qData } = await supabase
      .from("questions")
      .select("id, certification_id")
      .in("id", [...new Set(recentAttempts.map((a) => a.question_id))]);
    const certMap = new Map(
      (qData ?? []).map((q) => [q.id, q.certification_id])
    );

    const { data: certData } = await supabase
      .from("certifications")
      .select("id, name")
      .in("id", [...new Set((qData ?? []).map((q) => q.certification_id))]);

    const certNameMap = new Map((certData ?? []).map((c) => [c.id, c.name]));

    const byDateAndCert = new Map<string, { questions: Set<string>; certName: string }>();
    recentAttempts.forEach((a) => {
      const date = new Date(a.attempted_at).toISOString().slice(0, 10);
      const certId = certMap.get(a.question_id);
      const certName = certId ? certNameMap.get(certId) ?? "Unknown" : "Unknown";
      const key = `${date}-${certId}`;
      const existing = byDateAndCert.get(key);
      if (existing) {
        existing.questions.add(a.question_id);
      } else {
        byDateAndCert.set(key, { questions: new Set([a.question_id]), certName });
      }
    });

    byDateAndCert.forEach((v, k) => {
      const [date] = k.split("-");
      recentActivity.push({
        date,
        question_count: v.questions.size,
        cert_name: v.certName,
      });
    });
    recentActivity.sort((a, b) => b.date.localeCompare(a.date));
  }

  const { data: allCerts } = await supabase
    .from("certifications")
    .select("id, code, name, total_questions")
    .eq("is_active", true);

  const certIdsWithProgress = new Set(certProgress.map((c) => c.id));
  (allCerts ?? []).forEach((c) => {
    if (!certIdsWithProgress.has(c.id)) {
      certProgress.push({
        id: c.id,
        code: c.code,
        name: c.name,
        total_questions: c.total_questions,
        answered_count: 0,
        correct_count: 0,
        wrong_count: 0,
        correct_rate: 0,
      });
    }
  });

  certProgress.sort((a, b) => b.answered_count - a.answered_count);

  return {
    stats,
    certProgress,
    categoryBreakdown,
    recentActivity: recentActivity.slice(0, 7),
  };
}
