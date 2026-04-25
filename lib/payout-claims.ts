import { promises as fs } from "node:fs";
import path from "node:path";

type ClaimRecord = {
  txHash: string;
  ts: number;
};

type ClaimsShape = {
  claims: Record<string, ClaimRecord>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const CLAIMS_FILE = path.join(DATA_DIR, "payout-claims.json");

let cache: ClaimsShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

const norm = (address: string) => address.trim().toLowerCase();
const claimKey = (campaignId: string, address: string) => `${campaignId}::${norm(address)}`;

async function load(): Promise<ClaimsShape> {
  if (cache) return cache;

  try {
    const raw = await fs.readFile(CLAIMS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ClaimsShape>;
    cache = { claims: parsed.claims ?? {} };
  } catch {
    cache = { claims: {} };
  }

  return cache;
}

async function persist(): Promise<void> {
  if (!cache) return;
  const snapshot = JSON.stringify(cache, null, 2);
  writeChain = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CLAIMS_FILE, snapshot, "utf8");
  });
  await writeChain;
}

export async function getClaim(campaignId: string, address: string): Promise<ClaimRecord | null> {
  const s = await load();
  return s.claims[claimKey(campaignId, address)] ?? null;
}

export async function markClaim(campaignId: string, address: string, txHash: string): Promise<void> {
  const s = await load();
  s.claims[claimKey(campaignId, address)] = { txHash, ts: Date.now() };
  await persist();
}

