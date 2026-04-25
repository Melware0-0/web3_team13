import { privateKeyToAccount } from "viem/accounts";
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
} from "viem";
import { baseSepolia } from "viem/chains";
import { getBadgeTierByTokenId } from "@/lib/badges";

const erc1155MintAbi = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "mint",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const contractAddress = process.env.NFT_CONTRACT_ADDRESS as `0x${string}` | undefined;
const minterPrivateKey = process.env.NFT_MINTER_PRIVATE_KEY as `0x${string}` | undefined;
const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;

export const nftChain = baseSepolia;
export const nftExplorerBaseUrl = "https://sepolia.basescan.org/tx";

export function isNftMintConfigured(): boolean {
  return Boolean(contractAddress && minterPrivateKey);
}

function getPublicClient() {
  return createPublicClient({
    chain: nftChain,
    transport: http(rpcUrl),
  });
}

export async function readBadgeBalance(
  address: `0x${string}`,
  tokenId: number,
): Promise<number | null> {
  if (!contractAddress) return null;

  const publicClient = getPublicClient();
  const balance = await publicClient.readContract({
    address: contractAddress,
    abi: erc1155MintAbi,
    functionName: "balanceOf",
    args: [address, BigInt(tokenId)],
  });

  return Number(balance);
}

export async function mintBadgeToken(address: `0x${string}`, tokenId: number) {
  if (!contractAddress || !minterPrivateKey) {
    return { ok: false as const, reason: "nft_not_configured" };
  }
  if (!getBadgeTierByTokenId(tokenId)) {
    return { ok: false as const, reason: "unknown_badge_tier" };
  }

  const account = privateKeyToAccount(minterPrivateKey);
  const walletClient = createWalletClient({
    account,
    chain: nftChain,
    transport: http(rpcUrl),
  });
  const publicClient = getPublicClient();
  const contract = getContract({
    address: contractAddress,
    abi: erc1155MintAbi,
    client: { wallet: walletClient, public: publicClient },
  });

  try {
    const hash = await contract.write.mint([address, BigInt(tokenId), BigInt(1), "0x"]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      ok: true as const,
      tokenId,
      txHash: receipt.transactionHash,
      chainId: nftChain.id,
      explorerUrl: `${nftExplorerBaseUrl}/${receipt.transactionHash}`,
    };
  } catch (error) {
    return {
      ok: false as const,
      reason: error instanceof Error ? error.message : "mint_failed",
    };
  }
}
