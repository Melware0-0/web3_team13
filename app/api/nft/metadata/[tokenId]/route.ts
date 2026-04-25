import { NextResponse } from "next/server";
import { getCampaignByBadgeTokenId } from "@/lib/campaigns";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ tokenId: string }>;
};

export async function GET(req: Request, { params }: Params) {
  const { tokenId: rawTokenId } = await params;
  const tokenId = Number(rawTokenId);

  if (!Number.isInteger(tokenId) || tokenId < 0) {
    return NextResponse.json({ error: "invalid_token_id" }, { status: 400 });
  }

  const campaign = getCampaignByBadgeTokenId(tokenId);
  if (!campaign) {
    return NextResponse.json({ error: "unknown_token_id" }, { status: 404 });
  }

  const url = new URL(req.url);
  const origin = url.origin;
  const image = `${origin}/placeholder-logo.png`;
  const externalUrl = `${origin}/campaigns/${campaign.id}`;

  return NextResponse.json({
    name: `${campaign.brand} Completion Badge`,
    description: `Awarded for completing the ${campaign.title} learn-to-earn campaign on L2Earn.`,
    image,
    external_url: externalUrl,
    attributes: [
      {
        trait_type: "Campaign ID",
        value: campaign.id,
      },
      {
        trait_type: "Campaign",
        value: campaign.title,
      },
      {
        trait_type: "Brand",
        value: campaign.brand,
      },
      {
        trait_type: "Reward",
        value: `${(campaign.rewardCents / 100).toFixed(2)} dNZD`,
      },
      {
        trait_type: "Badge Token ID",
        value: tokenId.toString(),
      },
      {
        trait_type: "Badge Type",
        value: "Completion",
      },
    ],
  });
}
