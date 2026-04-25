import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Coins, Bot } from "lucide-react";

const features = [
  {
    title: "AI Tutor",
    icon: GraduationCap,
    description:
      "Every campaign generates a personalised quiz on the fly. The AI tutor explains wrong answers and adapts to what you actually learned — not a clickthrough.",
  },
  {
    title: "Stablecoin Payouts",
    icon: Coins,
    description:
      "Pass the quiz and dNZD lands in your wallet. Built on NewMoney's NZ-regulated, 1:1 reserve-backed Australasian stablecoin infrastructure.",
  },
  {
    title: "Agent-Readable",
    icon: Bot,
    description:
      "In 2126, the buyer is an AI agent. Every L2Earn campaign exposes a machine-readable feed so agents can index brands before recommending them.",
  },
];

export function FeatureCards() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            One campaign, two audiences.
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            L2Earn collapses customer education and agent indexing into a single rail —
            settled in dNZD.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group border-border/60 bg-card/60 backdrop-blur transition-all hover:border-primary/50 hover:bg-card"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
