import { NextResponse } from "next/server";
import { getBalanceCents, listNftClaims, listTxs } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "invalid_address" }, { status: 400 });
  }

  const [balanceCents, txs, nftClaims] = await Promise.all([
    getBalanceCents(address),
    listTxs(address),
    listNftClaims(address),
  ]);

  return NextResponse.json({
    address,
    currency: "dNZD",
    balanceCents,
    balance: (balanceCents / 100).toFixed(2),
    txs,
    nftClaims,
  });
}
