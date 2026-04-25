export type WalletTx = {
  campaignId: string;
  amountCents: number;
  ts: number;
};

type WalletRecord = {
  balanceCents: number;
  txs: WalletTx[];
};

const STORAGE_PREFIX = "l2earn.wallet.";
export const WALLET_UPDATED_EVENT = "l2earn:wallet-updated";

const norm = (address: string) => address.trim().toLowerCase();

function readWallet(address: string): WalletRecord {
  if (typeof window === "undefined") {
    return { balanceCents: 0, txs: [] };
  }

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${norm(address)}`);
  if (!raw) return { balanceCents: 0, txs: [] };

  try {
    const parsed = JSON.parse(raw) as Partial<WalletRecord>;
    return {
      balanceCents: parsed.balanceCents ?? 0,
      txs: parsed.txs ?? [],
    };
  } catch {
    return { balanceCents: 0, txs: [] };
  }
}

function writeWallet(address: string, wallet: WalletRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${norm(address)}`, JSON.stringify(wallet));
  window.dispatchEvent(new CustomEvent(WALLET_UPDATED_EVENT, { detail: { address: norm(address) } }));
}

export function getWallet(address: string): WalletRecord {
  return readWallet(address);
}

export function creditWallet(address: string, campaignId: string, amountCents: number) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
    return { ok: false as const, reason: "invalid_address" };
  }

  const wallet = readWallet(address);
  if (wallet.txs.some((tx) => tx.campaignId === campaignId)) {
    return { ok: false as const, reason: "already_claimed", balanceCents: wallet.balanceCents };
  }

  const nextWallet: WalletRecord = {
    balanceCents: wallet.balanceCents + amountCents,
    txs: [...wallet.txs, { campaignId, amountCents, ts: Date.now() }],
  };
  writeWallet(address, nextWallet);

  return { ok: true as const, balanceCents: nextWallet.balanceCents };
}
