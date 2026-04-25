import { NextResponse } from "next/server";
import { getBadgeTierByTokenId } from "@/lib/badges";

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

  const badgeTier = getBadgeTierByTokenId(tokenId);
  if (!badgeTier) {
    return NextResponse.json({ error: "unknown_token_id" }, { status: 404 });
  }

  const url = new URL(req.url);
  const origin = url.origin;
  const image = `${origin}${badgeTier.imagePath}`;
  const externalUrl = `${origin}/campaigns`;

  return NextResponse.json({
    name: badgeTier.title,
    description: badgeTier.description,
    image,
    external_url: externalUrl,
    attributes: [
      {
        trait_type: "Badge Type",
        value: "Lesson Milestone",
      },
      {
        trait_type: "Badge Token ID",
        value: tokenId.toString(),
      },
      {
        trait_type: "Lessons Completed",
        value: badgeTier.milestone.toString(),
      },
    ],
  });
}
