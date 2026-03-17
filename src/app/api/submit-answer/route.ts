import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, selectedOptionIds } = body as {
      questionId: string;
      selectedOptionIds: string[];
    };

    if (!questionId || !Array.isArray(selectedOptionIds)) {
      return NextResponse.json(
        { error: "Invalid request: questionId and selectedOptionIds required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: options, error: optError } = await supabase
      .from("options")
      .select("id, is_correct")
      .eq("question_id", questionId);

    if (optError || !options || options.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const correctIds = options.filter((o) => o.is_correct).map((o) => o.id);
    const sortedCorrect = [...correctIds].sort();
    const sortedSelected = [...selectedOptionIds].sort();

    const isCorrect =
      sortedCorrect.length === sortedSelected.length &&
      sortedCorrect.every((id, i) => id === sortedSelected[i]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_attempts").insert({
        user_id: user.id,
        question_id: questionId,
        selected_option_ids: selectedOptionIds,
        is_correct: isCorrect,
      });
    }

    const { data: question } = await supabase
      .from("questions")
      .select("explanation")
      .eq("id", questionId)
      .single();

    const explanation = question?.explanation ?? "";

    return NextResponse.json({
      isCorrect,
      correctOptionIds: correctIds,
      explanation,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
