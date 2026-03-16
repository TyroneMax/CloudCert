import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_CORRECT_OPTIONS,
  MOCK_EXPLANATIONS,
} from "@/lib/data/questions";

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

    const correctIds = MOCK_CORRECT_OPTIONS[questionId];
    const explanation = MOCK_EXPLANATIONS[questionId];

    if (!correctIds) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const sortedCorrect = [...correctIds].sort();
    const sortedSelected = [...selectedOptionIds].sort();

    const isCorrect =
      sortedCorrect.length === sortedSelected.length &&
      sortedCorrect.every((id, i) => id === sortedSelected[i]);

    // TODO: Insert into user_attempts when DB is ready
    // await supabase.from('user_attempts').insert({ user_id, question_id, selected_option_ids, is_correct })

    return NextResponse.json({
      isCorrect,
      correctOptionIds: correctIds,
      explanation: explanation ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
