"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Award, BookOpenCheck, Coins, ExternalLink, Loader2, Tags, Wallet } from "lucide-react";
import { useAccount, useEnsName } from "wagmi";
import { Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { CAMPAIGNS } from "@/lib/campaigns";
import { readLocalLearningState } from "@/lib/client-learning-store";
import { formatDnzd } from "@/lib/dnzd";

type ProfileNft = {
  tokenId: number;
  name: string;
  description: string;
  threshold: number;
  credential?: {
    wallet: string;
    course: string;
    score: number;
    total: number;
    luminSignedCertificateHash: string;
    mintTx: string;
  };
  certificate?: {
    status: "not_configured" | "signature_request_sent" | "error";
    signer: "Lumin";
    signatureRequestId?: string;
    documentHash: string;
    documentUrl?: string;
    luminDetailsUrl?: string;
    error?: string;
  };
  txHash: string;
  explorerUrl: string;
  ts: number;
};

type ProfileTx = {
  campaignId: string;
  amountCents: number;
  ts: number;
};

type ProfileResponse = {
  ok?: boolean;
  address?: string;
  balanceCents?: number;
  txs?: ProfileTx[];
  completedCampaigns?: { id: string; title: string; brand: string; tags: string[]; rewardCents: number }[];
  completedCount?: number;
  totalCampaigns?: number;
  nftClaims?: ProfileNft[];
  tagCounts?: Record<string, number>;
  error?: string;
};

const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const WalletConnector = dynamic(
  () => import("@/components/wallet-connector").then((mod) => mod.WalletConnector),
  { ssr: false },
);
const tagColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
];

export function ProfileDashboard() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setProfile(null);
      setLocalCompletedIds([]);
      return;
    }

    const walletAddress = address;
    let cancelled = false;
    const syncLocal = () => {
      if (!cancelled) {
        setLocalCompletedIds(readLocalLearningState(walletAddress).completedCampaignIds);
      }
    };
    async function loadProfile() {
      setLoading(true);
      setError(null);
      syncLocal();
      try {
        const res = await fetch(`/api/profile?userAddress=${encodeURIComponent(walletAddress)}`);
        const payload = (await res.json()) as ProfileResponse;
        if (!res.ok || !payload.ok) {
          throw new Error(payload.error ?? "Failed to load profile.");
        }
        if (!cancelled) setProfile(payload);
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : String(loadError);
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();
    window.addEventListener("l2earn-learning-updated", syncLocal);
    return () => {
      cancelled = true;
      window.removeEventListener("l2earn-learning-updated", syncLocal);
    };
  }, [address, isConnected]);

  const completedCampaigns = useMemo(() => {
    const byId = new Map(CAMPAIGNS.map((campaign) => [campaign.id, campaign]));
    const mergedIds = new Set([
      ...(profile?.completedCampaigns ?? []).map((campaign) => campaign.id),
      ...localCompletedIds,
    ]);
    return [...mergedIds].sort().map((campaignId) => {
      const campaign = byId.get(campaignId);
      return {
        id: campaignId,
        title: campaign?.title ?? campaignId,
        brand: campaign?.brand ?? "Unknown",
        tags: campaign?.tags ?? [],
        rewardCents: campaign?.rewardCents ?? 0,
      };
    });
  }, [localCompletedIds, profile?.completedCampaigns]);

  const mergedTagCounts = useMemo(
    () =>
      completedCampaigns.reduce<Record<string, number>>((acc, campaign) => {
        for (const tag of campaign.tags) {
          acc[tag] = (acc[tag] ?? 0) + 1;
        }
        return acc;
      }, {}),
    [completedCampaigns],
  );

  const sortedTags = useMemo(
    () =>
      Object.entries(mergedTagCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6),
    [mergedTagCounts],
  );
  const tagChartData = useMemo(
    () =>
      sortedTags.map(([tag, count], index) => ({
        tag,
        count,
        fill: tagColors[index % tagColors.length],
      })),
    [sortedTags],
  );
  const tagChartConfig = useMemo(
    () =>
      sortedTags.reduce<ChartConfig>((config, [tag], index) => {
        config[tag] = {
          label: tag,
          color: tagColors[index % tagColors.length],
        };
        return config;
      }, {}),
    [sortedTags],
  );

  if (!isConnected) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            Learning Passport
          </h1>
          <p className="mt-3 text-muted-foreground">
            Connect your wallet to view completed courses, dNZD earnings, and on-chain learning NFTs.
          </p>
        </div>
        <WalletConnector />
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
        <p className="font-semibold text-foreground">Profile failed to load</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const completedCount = completedCampaigns.length;
  const totalCampaigns = profile?.totalCampaigns ?? 0;
  const progress = totalCampaigns > 0 ? Math.round((completedCount / totalCampaigns) * 100) : 0;
  const nftClaims = profile?.nftClaims ?? [];
  const txs = profile?.txs ?? [];
  const displayName = ensName ?? (address ? shortAddress(address) : "Connected wallet");
  const certificateHref = (claim: ProfileNft) => {
    if (!profile?.address) return "#";
    const params = new URLSearchParams({ userAddress: profile.address });
    if (claim.credential) {
      params.set("campaignId", claim.credential.course);
      params.set("score", String(claim.credential.score));
      params.set("total", String(claim.credential.total));
      params.set("mintTx", claim.credential.mintTx);
    }
    return `/api/certificates/${claim.tokenId}?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border/60 bg-card/60 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Learning Passport
            </p>
            <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {displayName}
            </h1>
            <p className="mt-3 break-all text-sm text-muted-foreground">{address}</p>
          </div>
          <Button asChild>
            <Link href="/campaigns">
              <BookOpenCheck className="h-4 w-4" />
              Continue learning
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpenCheck className="h-4 w-4 text-primary" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">{completedCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">of {totalCampaigns} available</p>
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-primary" />
              dNZD Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-primary">
              {formatDnzd(profile?.balanceCents ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{txs.length} reward records</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-primary" />
              Credential NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-foreground">{nftClaims.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">verifiable identity credentials</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Learning Credential NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nftClaims.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                Complete your first course to mint a wallet-bound learning credential.
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {nftClaims.map((claim) => (
                  <li key={`${claim.tokenId}-${claim.txHash}`} className="rounded-lg border border-border/50 bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{claim.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{claim.description}</p>
                      </div>
                      <Badge variant="secondary">#{claim.tokenId}</Badge>
                    </div>
                    {claim.credential ? (
                      <p className="mt-3 break-all text-[11px] text-muted-foreground">
                        Wallet {shortAddress(claim.credential.wallet)} · course {claim.credential.course} · score{" "}
                        {claim.credential.score}/{claim.credential.total} · Lumin certificate hash{" "}
                        {claim.credential.luminSignedCertificateHash}
                      </p>
                    ) : null}
                    {claim.certificate ? (
                      <div className="mt-3 space-y-2 text-xs">
                        {claim.certificate.documentUrl || claim.certificate.luminDetailsUrl ? (
                          <a
                            href={claim.certificate.documentUrl ?? claim.certificate.luminDetailsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            Open signed certificate
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <div className="space-y-1">
                            <a
                              href={certificateHref(claim)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              Open generated PDF
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-muted-foreground">
                              Lumin certificate: {claim.certificate.status.replaceAll("_", " ")}
                              {claim.certificate.error ? ` (${claim.certificate.error})` : ""}
                            </p>
                          </div>
                        )}
                        {claim.certificate.signatureRequestId ? (
                          <p className="break-all text-[11px] text-muted-foreground">
                            Lumin request {claim.certificate.signatureRequestId}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {!claim.certificate ? (
                      <a
                        href={certificateHref(claim)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Open generated PDF
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                    <a
                      href={claim.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 break-all text-xs font-semibold text-primary hover:underline"
                    >
                      View mint tx
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tags className="h-5 w-5 text-primary" />
              Skill Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet.</p>
            ) : (
              <div className="space-y-4">
                <ChartContainer config={tagChartConfig} className="mx-auto aspect-square h-[240px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="tag" />}
                    />
                    <Pie
                      data={tagChartData}
                      dataKey="count"
                      nameKey="tag"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {tagChartData.map((entry) => (
                        <Cell key={entry.tag} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map(([tag, count], index) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: tagColors[index % tagColors.length] }}
                      />
                      {tag}
                      <span className="text-muted-foreground">x{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              Reward History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {txs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No dNZD reward records yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/40 rounded-lg border border-border/40 bg-background/40">
                {txs.map((tx) => (
                  <li key={`${tx.campaignId}-${tx.ts}`} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-sm font-semibold">{tx.campaignId}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(tx.ts).toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      +{formatDnzd(tx.amountCents)} dNZD
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
