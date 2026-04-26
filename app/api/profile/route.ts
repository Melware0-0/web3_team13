import { NextResponse } from "next/server";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getBalanceCents, listCompletedCampaigns, listNftClaims, listTxs } from "@/lib/store";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

function parseAddress(address: string | null): string | null {
  const trimmed = address?.trim();
  if (!trimmed || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  return trimmed;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userAddress = parseAddress(url.searchParams.get("userAddress"));

  if (!userAddress) {
    return badRequest("Invalid userAddress.");
  }

  const [balanceCents, txs, completedCampaignIds, nftClaims] = await Promise.all([
    getBalanceCents(userAddress),
    listTxs(userAddress),
    listCompletedCampaigns(userAddress),
    listNftClaims(userAddress),
  ]);

  const campaignById = new Map(CAMPAIGNS.map((campaign) => [campaign.id, campaign]));
  const completedCampaigns = completedCampaignIds.map((campaignId) => {
    const campaign = campaignById.get(campaignId);
    return {
      id: campaignId,
      title: campaign?.title ?? campaignId,
      brand: campaign?.brand ?? "Unknown",
      tags: campaign?.tags ?? [],
      rewardCents: campaign?.rewardCents ?? 0,
    };
  });

  const tagCounts = completedCampaigns.reduce<Record<string, number>>((acc, campaign) => {
    for (const tag of campaign.tags) {
      acc[tag] = (acc[tag] ?? 0) + 1;
    }
    return acc;
  }, {});

  return NextResponse.json({
    ok: true,
    address: userAddress,
    balanceCents,
    txs,
    completedCampaigns,
    completedCount: completedCampaigns.length,
    totalCampaigns: CAMPAIGNS.length,
    nftClaims,
    tagCounts,
  });
}
