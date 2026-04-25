import { NextResponse } from "next/server";
import { generateQuiz } from "@/lib/anthropic";
import { getCampaign } from "@/lib/campaigns";
import { rememberQuizSession } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { campaignId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const campaignId = body.campaignId;
  if (!campaignId) {
    return NextResponse.json({ error: "missing_campaignId" }, { status: 400 });
  }

  const campaign = getCampaign(campaignId);
  if (!campaign) {
    return NextResponse.json({ error: "unknown_campaign" }, { status: 404 });
  }

  let full;
  try {
    full = await generateQuiz({
      brand: campaign.brand,
      title: campaign.title,
      transcript: campaign.transcript,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "generate_failed", message: (e as Error).message },
      { status: 502 },
    );
  }

  const quizId = `${campaignId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  await rememberQuizSession(quizId, full);

  // Strip correctIndex / explanation before sending to client.
  const safe = full.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  return NextResponse.json({ quizId, questions: safe });
}
