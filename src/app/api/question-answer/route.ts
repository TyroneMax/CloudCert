import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/question-answer?questionId=xxx
 * Returns correct option IDs and explanation for memorization mode.
 * Requires question access (free or purchased).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: question, error: qError } = await supabase
      .from("questions")
      .select("id, is_free, certification_id, explanation")
      .eq("id", questionId)
      .eq("status", "published")
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!question.is_free) {
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .or(
          `certification_id.eq.${question.certification_id},plan_type.in.(monthly,yearly)`
        )
        .limit(1)
        .single();
      if (!sub) {
        return NextResponse.json({ error: "Question locked" }, { status: 403 });
      }
    }

    const { data: options } = await supabase
      .from("options")
      .select("id, is_correct")
      .eq("question_id", questionId);

    const correctIds = (options ?? []).filter((o) => o.is_correct).map((o) => o.id);

    return NextResponse.json({
      correctOptionIds: correctIds,
      explanation: question.explanation ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
