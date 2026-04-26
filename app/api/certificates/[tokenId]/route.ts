import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns";
import { createCertificatePdf } from "@/lib/lumin";
import { listNftClaims } from "@/lib/store";

export const runtime = "nodejs";

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

function parseAddress(address: string | null): string | null {
  const trimmed = address?.trim();
  if (!trimmed || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null;
  return trimmed;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const url = new URL(req.url);
  const userAddress = parseAddress(url.searchParams.get("userAddress"));
  const { tokenId } = await params;
  const id = Number.parseInt(tokenId, 10);

  if (!userAddress) return badRequest("Invalid userAddress.");
  if (!Number.isInteger(id) || id <= 0) return badRequest("Invalid tokenId.");

  const claims = await listNftClaims(userAddress);
  const claim = claims.find((item) => item.tokenId === id);
  const fallbackCampaignId = url.searchParams.get("campaignId")?.trim();
  const fallbackScore = Number.parseInt(url.searchParams.get("score") ?? "", 10);
  const fallbackTotal = Number.parseInt(url.searchParams.get("total") ?? "", 10);
  const fallbackMintTx = url.searchParams.get("mintTx")?.trim();

  if (!claim && (!fallbackCampaignId || !fallbackMintTx)) {
    return NextResponse.json({ ok: false, error: "Certificate not found." }, { status: 404 });
  }

  const courseId = claim?.campaignId ?? fallbackCampaignId!;
  const campaign = getCampaign(courseId);
  const pdf = createCertificatePdf({
    wallet: claim?.credential.wallet ?? userAddress,
    courseId,
    courseTitle: campaign?.title ?? courseId,
    brand: campaign?.brand ?? "L2Earn",
    score: claim?.credential.score ?? (Number.isInteger(fallbackScore) ? fallbackScore : 0),
    total: claim?.credential.total ?? (Number.isInteger(fallbackTotal) ? fallbackTotal : 0),
    tokenId: claim?.tokenId ?? id,
    mintTx: claim?.txHash ?? fallbackMintTx!,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="l2earn-certificate-${id}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
