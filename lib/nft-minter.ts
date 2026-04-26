import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";

const erc721MintAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "safeMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const erc1155MintAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

const erc1155MetadataAbi = [
  {
    type: "function",
    name: "setURI",
    stateMutability: "nonpayable",
    inputs: [{ name: "newuri", type: "string" }],
    outputs: [],
  },
] as const;

const EXPLORER_TX_BASE: Record<number, string> = {
  1: "https://etherscan.io/tx/",
  10: "https://optimistic.etherscan.io/tx/",
  137: "https://polygonscan.com/tx/",
  42161: "https://arbiscan.io/tx/",
  8453: "https://basescan.org/tx/",
  84532: "https://sepolia.basescan.org/tx/",
};

type MintFunctionName = "mint" | "safeMint";
type NftStandard = "erc721" | "erc1155";

export type MintedNft = {
  txHash: string;
  chainId: number;
  explorerUrl: string;
};

function requireAddress(value: string | undefined, label: string): `0x${string}` {
  const trimmed = value?.trim();
  if (!trimmed || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    throw new Error(`${label} is not configured or is invalid.`);
  }
  return trimmed as `0x${string}`;
}

function requirePrivateKey(value: string | undefined, label: string): `0x${string}` {
  const trimmed = value?.trim();
  if (!trimmed || !/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    throw new Error(`${label} is not configured or is invalid.`);
  }
  return trimmed as `0x${string}`;
}

export async function mintLearningNft(to: string, tokenId: number): Promise<MintedNft> {
  const contractAddress = requireAddress(process.env.NFT_CONTRACT_ADDRESS, "NFT_CONTRACT_ADDRESS");
  const privateKey = requirePrivateKey(
    process.env.NFT_MINTER_PRIVATE_KEY ?? process.env.MASTER_WALLET_PRIVATE_KEY,
    "NFT_MINTER_PRIVATE_KEY",
  );
  const rpcUrl = process.env.EVM_RPC_URL?.trim() ?? process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  if (!rpcUrl) {
    throw new Error("EVM_RPC_URL is not configured.");
  }

  const chainId = Number.parseInt(process.env.EVM_CHAIN_ID?.trim() ?? "84532", 10);
  const chain = chainId === base.id ? base : baseSepolia;
  const standard = (process.env.NFT_STANDARD?.trim().toLowerCase() || "erc1155") as NftStandard;
  const functionName = (process.env.NFT_MINT_FUNCTION?.trim() || "mint") as MintFunctionName;
  if (standard !== "erc721" && standard !== "erc1155") {
    throw new Error("NFT_STANDARD must be erc721 or erc1155.");
  }
  if (functionName !== "mint" && functionName !== "safeMint") {
    throw new Error("NFT_MINT_FUNCTION must be mint or safeMint.");
  }
  if (standard === "erc1155" && functionName !== "mint") {
    throw new Error("ERC1155 minting currently expects NFT_MINT_FUNCTION=mint.");
  }

  if (!Number.isInteger(tokenId) || tokenId <= 0) {
    throw new Error("NFT tokenId must be a positive integer.");
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const txHash =
    standard === "erc1155"
      ? await walletClient.writeContract({
          address: contractAddress,
          abi: erc1155MintAbi,
          functionName: "mint",
          args: [to as `0x${string}`, BigInt(tokenId), BigInt(1), "0x"],
        })
      : await walletClient.writeContract({
          address: contractAddress,
          abi: erc721MintAbi,
          functionName,
          args: [to as `0x${string}`, BigInt(tokenId)],
        });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    throw new Error(`NFT mint transaction reverted: ${txHash}`);
  }

  return {
    txHash,
    chainId,
    explorerUrl: EXPLORER_TX_BASE[chainId] ? `${EXPLORER_TX_BASE[chainId]}${txHash}` : txHash,
  };
}

export async function setLearningNftMetadataUri(uri: string): Promise<MintedNft> {
  const contractAddress = requireAddress(process.env.NFT_CONTRACT_ADDRESS, "NFT_CONTRACT_ADDRESS");
  const privateKey = requirePrivateKey(
    process.env.NFT_MINTER_PRIVATE_KEY ?? process.env.MASTER_WALLET_PRIVATE_KEY,
    "NFT_MINTER_PRIVATE_KEY",
  );
  const rpcUrl = process.env.EVM_RPC_URL?.trim() ?? process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();
  if (!rpcUrl) {
    throw new Error("EVM_RPC_URL is not configured.");
  }
  if (!/^https?:\/\/.+\{id\}/.test(uri)) {
    throw new Error("NFT metadata URI must be an absolute URL containing {id}.");
  }

  const chainId = Number.parseInt(process.env.EVM_CHAIN_ID?.trim() ?? "84532", 10);
  const chain = chainId === base.id ? base : baseSepolia;
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: erc1155MetadataAbi,
    functionName: "setURI",
    args: [uri],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    throw new Error(`NFT metadata URI transaction reverted: ${txHash}`);
  }

  return {
    txHash,
    chainId,
    explorerUrl: EXPLORER_TX_BASE[chainId] ? `${EXPLORER_TX_BASE[chainId]}${txHash}` : txHash,
  };
}
