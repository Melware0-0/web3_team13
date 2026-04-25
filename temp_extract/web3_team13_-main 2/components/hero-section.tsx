import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center md:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Bot className="h-3.5 w-3.5" />
          Built for the Great Handover
        </span>
        <h1 className="mx-auto mt-6 mb-6 max-w-4xl text-balance text-4xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Watch. Learn. <span className="text-primary">Earn dNZD.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          L2Earn is a learn-to-earn marketplace powered by NewMoney stablecoins. Brands run one
          campaign — humans learn through an AI tutor and earn dNZD, while AI agents index the
          same campaign through an open feed. Two audiences. One payout rail.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/campaigns">
            <Button size="lg" className="gap-2 px-8 py-6 text-lg font-semibold">
              Browse Campaigns
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/wallet">
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold">
              Connect Wallet
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
