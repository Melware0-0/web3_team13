"use client";

import { useEffect, useState } from "react";
import { getWallet, WALLET_UPDATED_EVENT, type WalletTx } from "@/lib/mock-wallet";

type UseDnzdWalletResult = {
  balanceCents: number | null;
  txs: WalletTx[];
  loading: boolean;
};

export function useDnzdWallet(address?: string, isConnected?: boolean): UseDnzdWalletResult {
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [txs, setTxs] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setBalanceCents(null);
      setTxs([]);
      setLoading(false);
      return;
    }

    const normalizedAddress = address.toLowerCase();

    const refreshWallet = () => {
      setLoading(true);
      const wallet = getWallet(address);
      setBalanceCents(wallet.balanceCents);
      setTxs([...wallet.txs].sort((a, b) => b.ts - a.ts));
      setLoading(false);
    };

    refreshWallet();

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ address?: string }>).detail;
      if (!detail?.address || detail.address === normalizedAddress) {
        refreshWallet();
      }
    };

    window.addEventListener(WALLET_UPDATED_EVENT, handleUpdate as EventListener);
    return () => {
      window.removeEventListener(WALLET_UPDATED_EVENT, handleUpdate as EventListener);
    };
  }, [address, isConnected]);

  return { balanceCents, txs, loading };
}
