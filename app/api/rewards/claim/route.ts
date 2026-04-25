import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { mintCampaignBadge } from "@/lib/nft";
import {
  credit,
  getBalanceCents,
  getNftClaim,
  hasClaimed,
  recordNftClaim,
} from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { address?: string; campaignId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { address, campaignId } = body;
  if (!address || !campaignId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const campaign = getCampaign(campaignId);
  if (!campaign) {
    return NextResponse.json({ error: "unknown_campaign" }, { status: 404 });
  }

  const alreadyCredited = await hasClaimed(address, campaignId);
  let balanceCents = await getBalanceCents(address);

  if (!alreadyCredited) {
    const creditResult = await credit(address, campaignId, campaign.rewardCents);
    if (!creditResult.ok) {
      const status = creditResult.reason === "already_claimed" ? 409 : 400;
      return NextResponse.json({ error: creditResult.reason }, { status });
    }
    balanceCents = creditResult.balanceCents;
  }

  let nftClaim = await getNftClaim(address, campaignId);
  let nftError: string | null = null;

  if (!nftClaim) {
    const minted = await mintCampaignBadge(address as `0x${string}`, campaignId);
    if (minted.ok) {
      const record = await recordNftClaim(address, {
        campaignId,
        tokenId: minted.tokenId,
        txHash: minted.txHash,
        chainId: minted.chainId,
        explorerUrl: minted.explorerUrl,
        ts: Date.now(),
      });
      if (record.ok) {
        nftClaim = await getNftClaim(address, campaignId);
      } else {
        nftError = record.reason;
      }
    } else {
      nftError = minted.reason;
    }
  }

  return NextResponse.json({
    ok: true,
    amountCents: campaign.rewardCents,
    balanceCents,
    currency: "dNZD",
    alreadyCredited,
    nft: nftClaim
      ? {
          ok: true,
          tokenId: nftClaim.tokenId,
          txHash: nftClaim.txHash,
          chainId: nftClaim.chainId,
          explorerUrl: nftClaim.explorerUrl,
        }
      : {
          ok: false,
          error: nftError ?? "mint_failed",
        },
  });
}
