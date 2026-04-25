import { NextResponse } from "next/server";
import { recallQuizSession } from "@/lib/store";

export const runtime = "nodejs";

const PASS_THRESHOLD = 2; // out of 3

export async function POST(req: Request) {
  let body: { quizId?: string; answers?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const quizId = body.quizId;
  const answers = body.answers ?? {};
  if (!quizId) {
    return NextResponse.json({ error: "missing_quizId" }, { status: 400 });
  }

  const questions = await recallQuizSession(quizId);
  if (!questions) {
    return NextResponse.json(
      { error: "quiz_expired", message: "Start a fresh quiz." },
      { status: 410 },
    );
  }

  const feedback = questions.map((q) => {
    const picked = answers[q.id];
    const correct = picked === q.correctIndex;
    return {
      questionId: q.id,
      correct,
      explanation: correct
        ? `Correct. ${q.explanation}`
        : `The right answer was: "${q.options[q.correctIndex]}". ${q.explanation}`,
    };
  });

  const score = feedback.filter((f) => f.correct).length;
  const passed = score >= PASS_THRESHOLD;

  return NextResponse.json({
    quizId,
    passed,
    score,
    total: questions.length,
    feedback,
  });
}
