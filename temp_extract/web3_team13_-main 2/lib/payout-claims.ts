type ClaimRecord = {
  txHash: string;
  ts: number;
};

const norm = (address: string) => address.trim().toLowerCase();
const claimKey = (campaignId: string, address: string) => `${campaignId}::${norm(address)}`;

// In-memory store for claims (persists during request handling)
// For persistent storage across deployments, integrate with a database (Postgres, Redis, etc.)
const claims = new Map<string, ClaimRecord>();

export async function getClaim(campaignId: string, address: string): Promise<ClaimRecord | null> {
  return claims.get(claimKey(campaignId, address)) ?? null;
}

export async function markClaim(campaignId: string, address: string, txHash: string): Promise<void> {
  claims.set(claimKey(campaignId, address), { txHash, ts: Date.now() });
}

