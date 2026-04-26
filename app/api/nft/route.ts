import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { createLuminLearningCertificate } from "@/lib/lumin";
import { mintLearningNft } from "@/lib/nft-minter";
import {
  getPendingNftMilestones,
  listCompletedCampaigns,
  listNftClaims,
  type NftClaim,
  NFT_MILESTONES,
  recordCourseCompletionAndNftClaims,
} from "@/lib/store";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

function serverError(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 502 });
}

function parseAddress(address: string | null): string | null {
  const trimmed = address?.trim();
  if (!trimmed || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  return trimmed;
}

function parseScore(value: unknown, fallback: number): number {
  return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : fallback;
}

function hashCredential(input: {
  wallet: string;
  course: string;
  score: number;
  total: number;
  tokenId: number;
  mintTx: string;
}) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userAddress = parseAddress(url.searchParams.get("userAddress"));

  if (!userAddress) {
    return badRequest("Invalid userAddress.");
  }

  const [claims, completedCampaigns] = await Promise.all([
    listNftClaims(userAddress),
    listCompletedCampaigns(userAddress),
  ]);

  return NextResponse.json({
    ok: true,
    milestones: NFT_MILESTONES,
    claims,
    completedCampaigns,
    completedCount: completedCampaigns.length,
  });
}

export async function POST(req: Request) {
  let body: { userAddress?: string; campaignId?: string; score?: number; total?: number };
  try {
    body = (await req.json()) as { userAddress?: string; campaignId?: string; score?: number; total?: number };
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const userAddress = parseAddress(body.userAddress ?? null);
  const campaignId = body.campaignId?.trim();

  if (!userAddress) {
    return badRequest("Invalid userAddress.");
  }
  const campaign = campaignId ? getCampaign(campaignId) : null;
  if (!campaignId || !campaign) {
    return badRequest("Invalid campaignId.");
  }
  const total = parseScore(body.total, campaign.quizQuestions.length);
  const score = Math.min(parseScore(body.score, total), total);

  const plan = await getPendingNftMilestones(userAddress, campaignId);
  if (!plan.ok) {
    return badRequest(plan.reason);
  }

  const mintedClaims: NftClaim[] = [];
  let mintError: string | null = null;
  try {
    for (const milestone of plan.pendingMilestones) {
      const mint = await mintLearningNft(userAddress, milestone.tokenId);
      const credentialInput = {
        wallet: userAddress,
        course: campaignId,
        score,
        total,
        tokenId: milestone.tokenId,
        mintTx: mint.txHash,
      };
      const certificate = await createLuminLearningCertificate({
        wallet: userAddress,
        courseId: campaignId,
        courseTitle: campaign.title,
        brand: campaign.brand,
        score,
        total,
        tokenId: milestone.tokenId,
        mintTx: mint.txHash,
      });
      mintedClaims.push({
        campaignId,
        holder: userAddress,
        tokenId: milestone.tokenId,
        name: milestone.name,
        description: milestone.description,
        imageUrl: milestone.imageUrl,
        threshold: milestone.threshold,
        completedCount: plan.completedCount,
        credential: {
          type: "LearningCredentialNFT",
          issuer: "L2Earn",
          signer: "Lumin",
          wallet: userAddress,
          course: campaignId,
          score,
          total,
          luminSignedCertificateHash: certificate.documentHash || hashCredential(credentialInput),
          mintTx: mint.txHash,
        },
        certificate,
        txHash: mint.txHash,
        chainId: mint.chainId,
        explorerUrl: mint.explorerUrl,
        ts: Date.now(),
      });
    }
  } catch (error) {
    mintError = error instanceof Error ? error.message : String(error);
  }

  const claimResult = await recordCourseCompletionAndNftClaims(
    userAddress,
    campaignId,
    plan.completedCampaigns,
    mintedClaims,
  );

  if (mintError) {
    return NextResponse.json(
      {
        ok: false,
        error: `NFT mint failed: ${mintError}`,
        courseCompletionRecorded: true,
        milestones: NFT_MILESTONES,
        completedCampaigns: plan.completedCampaigns,
        ...claimResult,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    milestones: NFT_MILESTONES,
    completedCampaigns: plan.completedCampaigns,
    ...claimResult,
  });
}
