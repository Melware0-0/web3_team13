import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, erc20Abi, formatUnits, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { getClaim, markClaim } from "@/lib/payout-claims";

export const runtime = "nodejs";

const CLAIM_LOCKS = new Set<string>();

function lockKey(campaignId: string, userAddress: string) {
  return `${campaignId}::${userAddress.trim().toLowerCase()}`;
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

function serverError(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function POST(req: Request) {
  let body: { userAddress?: string; campaignId?: string };
  try {
    body = (await req.json()) as { userAddress?: string; campaignId?: string };
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const userAddress = body.userAddress?.trim();
  const campaignId = body.campaignId?.trim();

  if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return badRequest("Invalid userAddress.");
  }
  if (!campaignId) {
    return badRequest("campaignId is required.");
  }

  const privateKey = process.env.MASTER_WALLET_PRIVATE_KEY?.trim();
  const configuredMasterAddress =
    process.env.MASTER_WALLET_ADDRESS?.trim() ?? "0xC7Fd206cC5534700B06A760CeAd2A0602aF036b7";
  const tokenAddress = process.env.NZD_TOKEN_ADDRESS?.trim() ?? "0x63ee4b77d3912DC7bCe711c3BE7bF12D532F1853";
  const rpcUrl = process.env.EVM_RPC_URL?.trim() ?? process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim() ?? "";
  const payoutAmount = process.env.NZD_PAYOUT_AMOUNT?.trim() ?? "5";
  const fallbackTokenDecimals = Number.parseInt(process.env.NZD_TOKEN_DECIMALS?.trim() ?? "18", 10);
  const chainId = Number.parseInt(process.env.EVM_CHAIN_ID?.trim() ?? "84532", 10);

  if (!privateKey) {
    return serverError("MASTER_WALLET_PRIVATE_KEY is not configured.");
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(configuredMasterAddress)) {
    return serverError("MASTER_WALLET_ADDRESS is invalid.");
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    return serverError("NZD_TOKEN_ADDRESS is invalid.");
  }
  if (!rpcUrl) {
    return serverError("EVM_RPC_URL is not configured.");
  }
  if (!Number.isFinite(fallbackTokenDecimals) || fallbackTokenDecimals < 0 || fallbackTokenDecimals > 36) {
    return serverError("NZD_TOKEN_DECIMALS is invalid.");
  }

  const key = lockKey(campaignId, userAddress);
  if (CLAIM_LOCKS.has(key)) {
    return NextResponse.json({ ok: false, error: "Claim already in progress." }, { status: 409 });
  }
  CLAIM_LOCKS.add(key);

  try {
    const existing = await getClaim(campaignId, userAddress);
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Reward already claimed for this campaign.",
          txHash: existing.txHash,
        },
        { status: 409 },
      );
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    if (account.address.toLowerCase() !== configuredMasterAddress.toLowerCase()) {
      return serverError(
        `MASTER_WALLET_PRIVATE_KEY does not match MASTER_WALLET_ADDRESS (${configuredMasterAddress}).`,
      );
    }
    const chain = chainId === base.id ? base : baseSepolia;

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });

    let tokenDecimals = fallbackTokenDecimals;
    try {
      tokenDecimals = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      });
    } catch {
      // Use configured fallback decimals when RPC read is unavailable.
      tokenDecimals = fallbackTokenDecimals;
    }

    const amount = parseUnits(payoutAmount, tokenDecimals);
    const senderBalance = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account.address],
    });

    if (senderBalance < amount) {
      return NextResponse.json(
        {
          ok: false,
          error: `Master wallet token balance too low. Has ${formatUnits(senderBalance, tokenDecimals)}, needs ${formatUnits(amount, tokenDecimals)}.`,
          details: {
            sender: account.address,
            tokenAddress,
            tokenDecimals,
            rawBalance: senderBalance.toString(),
            rawRequired: amount.toString(),
          },
        },
        { status: 409 },
      );
    }

    const txHash = await walletClient.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "transfer",
      args: [userAddress as `0x${string}`, amount],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return NextResponse.json({ ok: false, error: "Transaction reverted.", txHash }, { status: 502 });
    }

    await markClaim(campaignId, userAddress, txHash);

    return NextResponse.json({
      ok: true,
      txHash,
      message: `Sent ${payoutAmount} NZD from master wallet to ${userAddress}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: `Payout failed: ${message}` }, { status: 502 });
  } finally {
    CLAIM_LOCKS.delete(key);
  }
}
