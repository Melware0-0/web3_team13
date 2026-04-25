import { promises as fs } from "node:fs";
import path from "node:path";

export type ClaimRecord = {
  txHash: string;
  ts: number;
};

export type ClaimAttempt = {
  campaignId: string;
  userAddress: string;
  ip: string;
  browser: string;
  device: string;
  userAgent: string;
  outcome: "approved" | "manual_review" | "already_claimed" | "paid";
  reasons: string[];
  ts: number;
};

type ClaimsShape = {
  claims: Record<string, ClaimRecord>;
  attempts: ClaimAttempt[];
};

export type ClaimSignal = {
  campaignId: string;
  userAddress: string;
  ip: string;
  browser: string;
  device: string;
  userAgent: string;
};

export type RiskDecision = {
  flagged: boolean;
  reasons: string[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const CLAIMS_FILE = path.join(DATA_DIR, "payout-claims.json");

let cache: ClaimsShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

const norm = (value: string) => value.trim().toLowerCase();
const claimKey = (campaignId: string, address: string) => `${campaignId}::${norm(address)}`;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

async function load(): Promise<ClaimsShape> {
  if (cache) return cache;

  try {
    const raw = await fs.readFile(CLAIMS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<ClaimsShape>;
    cache = {
      claims: parsed.claims ?? {},
      attempts: parsed.attempts ?? [],
    };
  } catch {
    cache = { claims: {}, attempts: [] };
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

export async function listRecentAttempts(): Promise<ClaimAttempt[]> {
  const s = await load();
  const cutoff = Date.now() - RECENT_WINDOW_MS;
  return s.attempts.filter((attempt) => attempt.ts >= cutoff);
}

export async function evaluateClaimRisk(signal: ClaimSignal): Promise<RiskDecision> {
  const recentAttempts = await listRecentAttempts();
  const reasons: string[] = [];
  const address = norm(signal.userAddress);
  const ip = norm(signal.ip);
  const browser = norm(signal.browser);
  const device = norm(signal.device);

  const sameIpDifferentAddresses = new Set(
    recentAttempts
      .filter((attempt) => norm(attempt.ip) === ip && norm(attempt.userAddress) !== address)
      .map((attempt) => norm(attempt.userAddress)),
  );
  if (ip !== "unknown" && sameIpDifferentAddresses.size >= 1) {
    reasons.push("IP already used by another wallet address.");
  }

  const sameDeviceDifferentAddresses = new Set(
    recentAttempts
      .filter((attempt) => norm(attempt.device) === device && norm(attempt.userAddress) !== address)
      .map((attempt) => norm(attempt.userAddress)),
  );
  if (device !== "unknown" && sameDeviceDifferentAddresses.size >= 1) {
    reasons.push("Device fingerprint already used by another wallet address.");
  }

  const sameBrowserDifferentAddresses = new Set(
    recentAttempts
      .filter(
        (attempt) =>
          norm(attempt.browser) === browser &&
          norm(attempt.userAgent) === norm(signal.userAgent) &&
          norm(attempt.userAddress) !== address,
      )
      .map((attempt) => norm(attempt.userAddress)),
  );
  if (browser !== "unknown" && sameBrowserDifferentAddresses.size >= 2) {
    reasons.push("Browser fingerprint has multiple recent wallet claims.");
  }

  const recentIpAttempts = recentAttempts.filter((attempt) => norm(attempt.ip) === ip);
  if (ip !== "unknown" && recentIpAttempts.length >= 3) {
    reasons.push("High claim activity from the same IP in the last 24 hours.");
  }

  return { flagged: reasons.length > 0, reasons };
}

export async function recordClaimAttempt(
  signal: ClaimSignal,
  outcome: ClaimAttempt["outcome"],
  reasons: string[] = [],
): Promise<void> {
  const s = await load();
  s.attempts = [
    ...s.attempts.filter((attempt) => attempt.ts >= Date.now() - RECENT_WINDOW_MS * 7),
    {
      campaignId: signal.campaignId,
      userAddress: norm(signal.userAddress),
      ip: signal.ip || "unknown",
      browser: signal.browser || "unknown",
      device: signal.device || "unknown",
      userAgent: signal.userAgent || "unknown",
      outcome,
      reasons,
      ts: Date.now(),
    },
  ];
  await persist();
}

export async function markClaim(campaignId: string, address: string, txHash: string): Promise<void> {
  const s = await load();
  s.claims[claimKey(campaignId, address)] = { txHash, ts: Date.now() };
  await persist();
}
