import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import solc from "solc";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const contractFile = path.join(process.cwd(), "contracts", "L2EarnBadges.sol");
const source = fs.readFileSync(contractFile, "utf8");

const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const privateKey = process.env.NFT_MINTER_PRIVATE_KEY;
const metadataUri =
  process.env.NFT_BASE_METADATA_URI ||
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") + "/api/nft/metadata/{id}";

if (!privateKey) {
  throw new Error("Missing NFT_MINTER_PRIVATE_KEY in environment");
}

if (!metadataUri || metadataUri.startsWith("undefined")) {
  throw new Error(
    "Missing NFT_BASE_METADATA_URI or NEXT_PUBLIC_APP_URL. Example: https://your-app.vercel.app/api/nft/metadata/{id}",
  );
}

function findImports(importPath) {
  const fullPath = path.join(process.cwd(), "node_modules", importPath);
  if (!fs.existsSync(fullPath)) {
    return { error: `File not found: ${importPath}` };
  }
  return { contents: fs.readFileSync(fullPath, "utf8") };
}

const input = {
  language: "Solidity",
  sources: {
    "contracts/L2EarnBadges.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
if (output.errors?.length) {
  const fatal = output.errors.filter((error) => error.severity === "error");
  if (fatal.length) {
    for (const error of fatal) console.error(error.formattedMessage);
    process.exit(1);
  }
}

const artifact = output.contracts["contracts/L2EarnBadges.sol"]?.L2EarnBadges;
if (!artifact) {
  throw new Error("Failed to compile L2EarnBadges");
}

const account = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(rpcUrl),
});

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: `0x${artifact.evm.bytecode.object}`,
  args: [metadataUri, account.address],
});

console.log(`Deployment tx: https://sepolia.basescan.org/tx/${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (!receipt.contractAddress) {
  throw new Error("Deployment succeeded but no contract address was returned");
}

console.log(`Contract address: ${receipt.contractAddress}`);
