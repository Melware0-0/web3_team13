import { NextResponse } from "next/server";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getBalanceCents, listCompletedCampaigns, listNftClaims, listTxs } from "@/lib/store";
import { formatDnzd } from "@/lib/dnzd";

export const runtime = "nodejs";

type ClaimCertificate = {
  status?: string;
  signer?: string;
  brand?: string;
  courseTitle?: string;
  documentHash?: string;
  documentUrl?: string;
  luminDetailsUrl?: string;
  score?: number;
  total?: number;
  issuedAt?: string;
};

type ClaimWithCertificate = Awaited<ReturnType<typeof listNftClaims>>[number] & {
  certificate?: ClaimCertificate;
};

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
  const origin = url.origin;
  const address = parseAddress(url.searchParams.get("address"));

  if (!address) {
    return badRequest("Invalid address.");
  }

  const [balanceCents, txs, completedCampaignIds, nftClaims] = await Promise.all([
    getBalanceCents(address),
    listTxs(address),
    listCompletedCampaigns(address),
    listNftClaims(address),
  ]);

  const campaignById = new Map(CAMPAIGNS.map((campaign) => [campaign.id, campaign]));
  const completedCampaigns = completedCampaignIds.map((campaignId) => {
    const campaign = campaignById.get(campaignId);
    return {
      id: campaignId,
      brand: campaign?.brand ?? "Unknown",
      title: campaign?.title ?? campaignId,
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

  const credentials = nftClaims.map((rawClaim) => {
    const claim = rawClaim as ClaimWithCertificate;
    const campaign = campaignById.get(claim.campaignId);
    return {
      type: "LearningCredentialNFT",
      issuer: "L2Earn",
      signer: claim.credential.signer,
      holder: address,
      campaign: {
        id: claim.campaignId,
        brand: campaign?.brand ?? claim.certificate?.brand ?? "Unknown",
        title: campaign?.title ?? claim.certificate?.courseTitle ?? claim.campaignId,
        tags: campaign?.tags ?? [],
      },
      credential: {
        standard: "ERC1155",
        wallet: claim.credential.wallet,
        course: claim.credential.course,
        score: `${claim.credential.score}/${claim.credential.total}`,
        luminSignedCertificateHash: claim.credential.luminSignedCertificateHash,
        mintTx: claim.credential.mintTx,
      },
      nft: {
        standard: "ERC1155",
        tokenId: claim.tokenId,
        name: claim.name,
        description: claim.description,
        image: claim.imageUrl ? new URL(claim.imageUrl, origin).toString() : undefined,
        metadataUrl: `${origin}/api/nft/metadata/${claim.tokenId}`,
        mintTx: claim.txHash,
        explorerUrl: claim.explorerUrl,
        chainId: claim.chainId,
      },
      certificate: claim.certificate
        ? {
            status: claim.certificate.status,
            signer: claim.certificate.signer,
            documentHash: claim.certificate.documentHash,
            documentUrl: claim.certificate.documentUrl,
            luminDetailsUrl: claim.certificate.luminDetailsUrl,
            score: `${claim.certificate.score}/${claim.certificate.total}`,
            issuedAt: claim.certificate.issuedAt,
          }
        : null,
      verification: {
        onChainMintPresent: Boolean(claim.txHash),
        signedCertificatePresent: Boolean(claim.credential.luminSignedCertificateHash),
        machineReadableMetadata: `${origin}/api/nft/metadata/${claim.tokenId}`,
      },
    };
  });

  return NextResponse.json({
    ok: true,
    type: "L2EarnAgentLearningPassport",
    version: "1.0",
    address,
    summary: {
      completedCourses: completedCampaigns.length,
      totalCampaigns: CAMPAIGNS.length,
      earned: {
        asset: "dNZD",
        amount: formatDnzd(balanceCents),
        amountCents: balanceCents,
      },
      credentialCount: credentials.length,
      topTags: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count })),
    },
    credentials,
    completedCampaigns,
    rewardHistory: txs.map((tx) => ({
      campaignId: tx.campaignId,
      amount: formatDnzd(tx.amountCents),
      amountCents: tx.amountCents,
      ts: tx.ts,
    })),
    agentDecisionHints: {
      canRecommendNewMoney: completedCampaigns.some((campaign) => campaign.brand === "NewMoney"),
      knowsStablecoins: Boolean(tagCounts.Stablecoins),
      knowsDeFi: Boolean(tagCounts.DeFi),
      verifiedBy: ["Wallet address", "ERC1155 credential metadata", "Lumin certificate hash"],
    },
  });
}
