import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Claude client. Never import from a client component.
 * Falls back to a deterministic stub if ANTHROPIC_API_KEY is missing
 * so the demo still works for judges who don't have the key set.
 */

export const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY);

export const client = HAS_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const QUIZ_MODEL = "claude-haiku-4-5-20251001";

export type GeneratedQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  /** Why the correct answer is correct — used for grading feedback. */
  explanation: string;
};

export async function generateQuiz(args: {
  brand: string;
  title: string;
  transcript: string;
}): Promise<GeneratedQuestion[]> {
  if (!client) return stubQuiz();

  const system = `You are an AI tutor for L2Earn, a learn-to-earn platform. From the source text, write exactly 3 multiple-choice questions that verify a learner watched the video and understood it. Rules:
- Each question MUST be answerable from the source text only.
- Provide 4 options. Exactly one is correct.
- Make distractors plausible but unambiguously wrong.
- Keep options under 18 words.
- Output ONLY a JSON array with this exact shape, no prose, no markdown fence:
[{"question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"..."}]`;

  const user = `BRAND: ${args.brand}
TITLE: ${args.title}

SOURCE TEXT:
"""
${args.transcript}
"""

Return the JSON array now.`;

  const resp = await client.messages.create({
    model: QUIZ_MODEL,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const arr = parseJsonArray(text);
  return arr.map((q, i) => ({
    id: `q${i + 1}`,
    question: String(q.question),
    options: (q.options as string[]).map(String),
    correctIndex: Number(q.correctIndex),
    explanation: String(q.explanation ?? ""),
  }));
}

function parseJsonArray(text: string): Record<string, unknown>[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end < 0) throw new Error("Claude returned no JSON array");
  return JSON.parse(raw.slice(start, end + 1));
}

function stubQuiz(): GeneratedQuestion[] {
  return [
    {
      id: "q1",
      question: "What is dNZD?",
      options: [
        "A blockchain-based digital representation of the New Zealand Dollar",
        "A New Zealand government bond",
        "A volatile cryptocurrency unrelated to NZD",
        "A KiwiSaver investment fund",
      ],
      correctIndex: 0,
      explanation:
        "dNZD is a blockchain-based digital representation of the New Zealand Dollar, fully backed 1:1 by fiat reserves.",
    },
    {
      id: "q2",
      question: "Which networks does dNZD currently live on?",
      options: [
        "Only Ethereum mainnet",
        "Bitcoin and Litecoin",
        "Ethereum, Base, Polygon, and Solana",
        "A private NewMoney chain",
      ],
      correctIndex: 2,
      explanation: "dNZD is live on Ethereum, Base, Polygon, and Solana, with cross-chain via LayerZero.",
    },
    {
      id: "q3",
      question: "What backs every dNZD token?",
      options: [
        "Algorithmic supply controls",
        "Fiat reserves held in trust 1:1 in a New Zealand-registered bank",
        "Government promises",
        "A basket of cryptocurrencies",
      ],
      correctIndex: 1,
      explanation: "Every token represents a 1:1 redeemable beneficial interest in fiat held in a NZ bank trust.",
    },
  ];
}
