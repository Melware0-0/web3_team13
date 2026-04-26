import fs from 'fs';
import path from 'path';

// Vercel's filesystem is read-only except /tmp; use /tmp when running on Vercel
const DATA_DIR = process.env.VERCEL
  ? '/tmp'
  : path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export interface UserData {
  address: string;
  balance: number; // in dNZD cents
  completedCampaigns: string[]; // campaign IDs
  txs: Array<{
    campaignId: string;
    amount: number;
    timestamp: number;
  }>;
  streak: number;
  lastCompletionDate: number | null;
  badges: string[];
}

// NFT & Milestone types (from estellefinal)
export interface NftClaim {
  campaignId: string;
  milestone: string; // e.g., "first-course", "5-courses", "10-courses"
  tokenId: number;
  mintTx: string;
  timestamp: number;
  certificateHash?: string;
}

export const NFT_MILESTONES = [
  { id: "first-course", threshold: 1, title: "First Course", description: "Completed your first course" },
  { id: "5-courses", threshold: 5, title: "Course Enthusiast", description: "Completed 5 courses" },
  { id: "10-courses", threshold: 10, title: "Course Master", description: "Completed 10 courses" },
  { id: "15-courses", threshold: 15, title: "Expert Learner", description: "Completed 15 courses" },
  { id: "20-courses", threshold: 20, title: "Learning Legend", description: "Completed 20 courses" },
];

export interface StoreData {
  users: Record<string, UserData>;
  nftClaims: Record<string, NftClaim[]>; // address -> NftClaims[]
}

function ensureStoreExists(): StoreData {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initialData: StoreData = { users: {}, nftClaims: {} };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(data) as StoreData;
    // Ensure nftClaims exists (for backward compatibility)
    if (!parsed.nftClaims) {
      parsed.nftClaims = {};
    }
    return parsed;
  } catch {
    return { users: {}, nftClaims: {} };
  }
}

function saveStore(data: StoreData): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
  } catch {
    // silently fail on read-only filesystems
  }
}

export function getUser(address: string): UserData {
  const store = ensureStoreExists();
  if (!store.users[address]) {
    store.users[address] = {
      address,
      balance: 0,
      completedCampaigns: [],
      txs: [],
      streak: 0,
      lastCompletionDate: null,
      badges: [],
    };
    saveStore(store);
  }
  return store.users[address];
}

export function getBalance(address: string): number {
  return getUser(address).balance;
}

export function getBalanceCents(address: string): number {
  return getUser(address).balance;
}

export function creditUser(
  address: string,
  campaignId: string,
  amount: number
): boolean {
  const store = ensureStoreExists();
  const user = store.users[address] || getUser(address);

  // Check if already completed
  if (user.completedCampaigns.includes(campaignId)) {
    return false;
  }

  user.balance += amount;
  user.completedCampaigns.push(campaignId);
  user.txs.push({
    campaignId,
    amount,
    timestamp: Date.now(),
  });

  // Update streak
  const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const lastDate = user.lastCompletionDate
    ? Math.floor(user.lastCompletionDate / (1000 * 60 * 60 * 24))
    : today - 1;

  if (today === lastDate + 1) {
    user.streak++;
  } else if (today !== lastDate) {
    user.streak = 1;
  }

  user.lastCompletionDate = Date.now();

  // Award badges
  const newBadges = [];
  if (user.streak === 5 && !user.badges.includes('streak-5')) {
    newBadges.push('streak-5');
  }
  if (user.completedCampaigns.length === 1 && !user.badges.includes('first-campaign')) {
    newBadges.push('first-campaign');
  }
  if (
    user.completedCampaigns.length === 3 &&
    !user.badges.includes('quiz-master')
  ) {
    newBadges.push('quiz-master');
  }

  user.badges = [...new Set([...user.badges, ...newBadges])];

  store.users[address] = user;
  saveStore(store);
  return true;
}

export function getLeaderboard(limit: number = 10): UserData[] {
  const store = ensureStoreExists();
  return Object.values(store.users)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}

export function listTxs(address: string): Array<any> {
  return getUser(address).txs;
}

// ─── NFT & Milestone Functions ────────────────────────────────────────────

export function listCompletedCampaigns(address: string): string[] {
  return getUser(address).completedCampaigns;
}

export function listNftClaims(address: string): NftClaim[] {
  const store = ensureStoreExists();
  return store.nftClaims[address] || [];
}

export function recordNftClaim(address: string, claim: NftClaim): void {
  const store = ensureStoreExists();
  if (!store.nftClaims[address]) {
    store.nftClaims[address] = [];
  }
  store.nftClaims[address].push(claim);
  saveStore(store);
}

export function getPendingNftMilestones(address: string): string[] {
  const user = getUser(address);
  const claims = listNftClaims(address);
  const claimedMilestones = new Set(claims.map(c => c.milestone));

  const completedCount = user.completedCampaigns.length;
  const pending: string[] = [];

  for (const milestone of NFT_MILESTONES) {
    if (!claimedMilestones.has(milestone.id) && completedCount >= milestone.threshold) {
      pending.push(milestone.id);
    }
  }

  return pending;
}

export function recordCourseCompletionAndNftClaims(
  address: string,
  campaignId: string,
  amount: number,
  nftClaimsToRecord: NftClaim[] = []
): boolean {
  const success = creditUser(address, campaignId, amount);

  if (success && nftClaimsToRecord.length > 0) {
    for (const claim of nftClaimsToRecord) {
      recordNftClaim(address, claim);
    }
  }

  return success;
}
