import { NextResponse } from "next/server";
import { getBadgeTierForCompletedLessons } from "@/lib/badges";
import { getCampaign } from "@/lib/campaigns";
import { mintBadgeToken } from "@/lib/nft";
import {
  credit,
  getBalanceCents,
  getCompletedLessonCount,
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
  let completedLessons = await getCompletedLessonCount(address);

  if (!alreadyCredited) {
    const creditResult = await credit(address, campaignId, campaign.rewardCents);
    if (!creditResult.ok) {
      const status = creditResult.reason === "already_claimed" ? 409 : 400;
      return NextResponse.json({ error: creditResult.reason }, { status });
    }
    balanceCents = creditResult.balanceCents;
    completedLessons += 1;
  }

  const unlockedTier = getBadgeTierForCompletedLessons(completedLessons);
  let nftClaim = unlockedTier ? await getNftClaim(address, unlockedTier.key) : null;
  let nftError: string | null = null;

  if (unlockedTier && !nftClaim) {
    const minted = await mintBadgeToken(address as `0x${string}`, unlockedTier.tokenId);
    if (minted.ok) {
      const record = await recordNftClaim(address, {
        claimKey: unlockedTier.key,
        label: unlockedTier.title,
        tokenId: minted.tokenId,
        txHash: minted.txHash,
        chainId: minted.chainId,
        explorerUrl: minted.explorerUrl,
        ts: Date.now(),
      });
      if (record.ok) {
        nftClaim = await getNftClaim(address, unlockedTier.key);
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
    completedLessons,
    nft: nftClaim
      ? {
          ok: true,
          title: nftClaim.label,
          milestone: unlockedTier?.milestone ?? null,
          tokenId: nftClaim.tokenId,
          txHash: nftClaim.txHash,
          chainId: nftClaim.chainId,
          explorerUrl: nftClaim.explorerUrl,
        }
      : {
          ok: false,
          error: nftError ?? (unlockedTier ? "mint_failed" : "no_badge_unlocked"),
        },
  });
}
