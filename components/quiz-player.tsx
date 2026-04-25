"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { creditWallet } from "@/lib/mock-wallet";
import { getCampaign } from "@/lib/campaigns";
import { CheckCircle2, XCircle, Sparkles, Wallet, Loader2, Coins } from "lucide-react";
import Link from "next/link";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct?: number;
};

export type QuizState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; quizId: string; questions: QuizQuestion[] }
  | { status: "grading"; quizId: string; questions: QuizQuestion[] }
  | {
      status: "graded";
      passed: boolean;
      score: number;
      total: number;
      feedback: { questionId: string; correct: boolean; explanation: string }[];
    }
  | { status: "credited"; amountCents: number; balanceCents: number }
  | { status: "claimed"; balanceCents: number }
  | { status: "error"; message: string };

type Props = {
  campaignId: string;
  rewardCents: number;
};

export function QuizPlayer({ campaignId, rewardCents }: Props) {
  const { address, isConnected } = useAppKitAccount();
  const [state, setState] = useState<QuizState>({ status: "idle" });
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const reward = (rewardCents / 100).toFixed(2);

  async function startQuiz() {
    setState({ status: "loading" });
    setAnswers({});
    try {
      const campaign = getCampaign(campaignId);
      if (!campaign) throw new Error("Campaign not found");
      const quizId = `${campaignId}-${Date.now()}`;
      const questions = campaign.quizQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        options: question.options,
      }));
      setState({ status: "ready", quizId, questions });
    } catch (e) {
      setState({ status: "error", message: (e as Error).message });
    }
  }

  async function submitQuiz() {
    if (state.status !== "ready") return;
    const { quizId, questions } = state;
    setState({ status: "grading", quizId, questions });
    try {
      const campaign = getCampaign(campaignId);
      if (!campaign) throw new Error("Campaign not found");

      const feedback = campaign.quizQuestions.map((question) => {
        const picked = answers[question.id];
        const correct = picked === question.correctIndex;
        return {
          questionId: question.id,
          correct,
          explanation: correct
            ? `Correct. ${question.explanation}`
            : `The right answer was: "${question.options[question.correctIndex]}". ${question.explanation}`,
        };
      });
      const score = feedback.filter((item) => item.correct).length;
      const passed = score >= 2;
      setState({
        status: "graded",
        passed,
        score,
        total: campaign.quizQuestions.length,
        feedback,
      });

      if (passed && address) {
        const credit = creditWallet(address, campaignId, rewardCents);
        if (credit.ok) {
          setState({
            status: "credited",
            amountCents: rewardCents,
            balanceCents: credit.balanceCents,
          });
        } else if (credit.reason === "already_claimed" && typeof credit.balanceCents === "number") {
          setState({
            status: "claimed",
            balanceCents: credit.balanceCents,
          });
        }
      }
    } catch (e) {
      setState({ status: "error", message: (e as Error).message });
    }
  }

  if (!isConnected) {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Connect a wallet first</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We need somewhere to send your {reward} dNZD payout when you pass.
            </p>
          </div>
          <Link href="/wallet">
            <Button size="lg" className="gap-2 font-semibold">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "idle") {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Ready when you are.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Read the campaign brief, then take the quiz. Pass 2 of 3 to earn {reward} dNZD.
            </p>
          </div>
          <Button size="lg" onClick={startQuiz} className="gap-2 font-semibold">
            <Sparkles className="h-4 w-4" />
            Start AI Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "loading") {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your campaign quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "ready" || state.status === "grading") {
    const allAnswered =
      state.status === "ready" && state.questions.every((q) => answers[q.id] !== undefined);

    return (
      <div className="space-y-4">
        {state.status === "ready" &&
          state.questions.map((q, i) => (
            <Card key={q.id} className="border-border/60 bg-card/60">
              <CardContent className="p-6">
                <p className="mb-4 text-base font-semibold">
                  {i + 1}. {q.question}
                </p>
                <RadioGroup
                  value={answers[q.id]?.toString() ?? ""}
                  onValueChange={(v) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: parseInt(v, 10) }))
                  }
                >
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/30"
                    >
                      <RadioGroupItem value={idx.toString()} id={`${q.id}-${idx}`} className="mt-0.5" />
                      <Label htmlFor={`${q.id}-${idx}`} className="cursor-pointer text-sm leading-relaxed">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        <Button
          size="lg"
          className="w-full gap-2 font-semibold"
          disabled={state.status === "grading" || !allAnswered}
          onClick={submitQuiz}
        >
          {state.status === "grading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your answers...
            </>
          ) : (
            <>Submit answers</>
          )}
        </Button>
      </div>
    );
  }

  if (state.status === "graded") {
    return (
      <div className="space-y-4">
        <Alert
          className={
            state.passed ? "border-primary/40 bg-primary/10" : "border-destructive/40 bg-destructive/10"
          }
        >
          {state.passed ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <AlertDescription className="ml-2 text-base font-semibold">
            {state.passed
              ? `Passed - ${state.score}/${state.total}. Crediting your wallet...`
              : `Not quite - ${state.score}/${state.total}. Try again to earn ${reward} dNZD.`}
          </AlertDescription>
        </Alert>
        {state.feedback.map((f) => (
          <Card key={f.questionId} className="border-border/60 bg-card/60">
            <CardContent className="p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                {f.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {f.correct ? "Correct" : "Incorrect"}
              </p>
              <p className="mt-1 text-muted-foreground">{f.explanation}</p>
            </CardContent>
          </Card>
        ))}
        {!state.passed ? (
          <Button size="lg" onClick={startQuiz} className="w-full gap-2 font-semibold">
            <Sparkles className="h-4 w-4" />
            Try a fresh quiz
          </Button>
        ) : null}
      </div>
    );
  }

  if (state.status === "credited") {
    return (
      <Card className="border-primary/40 bg-primary/10">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black">+{(state.amountCents / 100).toFixed(2)} dNZD</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              New balance: {(state.balanceCents / 100).toFixed(2)} dNZD
            </p>
          </div>
          <Link href="/wallet">
            <Button size="lg" className="gap-2 font-semibold">
              <Wallet className="h-4 w-4" />
              View Wallet
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "claimed") {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black">Reward already claimed</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You already earned this campaign payout. Current balance: {(state.balanceCents / 100).toFixed(2)} dNZD
            </p>
          </div>
          <Link href="/wallet">
            <Button size="lg" className="gap-2 font-semibold">
              <Wallet className="h-4 w-4" />
              View Wallet
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-5 w-5" />
        <AlertDescription className="ml-2">
          Something went wrong: {state.message}. Try again.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
