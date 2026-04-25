import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/lib/campaigns";
import { formatDnzd } from "@/lib/dnzd";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaigns/${campaign.id}`} className="group block">
      <Card className="h-full border-border/60 bg-card/60 backdrop-blur transition-all group-hover:border-primary/50 group-hover:bg-card">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {campaign.brand}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              <Coins className="h-3.5 w-3.5" />
              {formatDnzd(campaign.rewardCents)} dNZD
            </span>
          </div>
          <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            {campaign.title}
          </h3>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
            {campaign.summary}
          </p>
          <div className="flex items-end justify-between">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                {campaign.quizQuestions.length} question quiz
              </Badge>
              {campaign.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
              Start
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
