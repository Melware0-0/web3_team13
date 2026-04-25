"use client";

import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, History, Loader2 } from "lucide-react";

type Tx = { campaignId: string; amountCents: number; ts: number };

export function DnzdBalance() {
  const { address, isConnected } = useAppKitAccount();
  const [balance, setBalance] = useState<string | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(null);
      setTxs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet?address=${address}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setBalance(data.balance);
        setTxs(data.txs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <Card className="w-full max-w-md border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-primary" />
          Your dNZD
          <span className="ml-auto text-xs font-normal text-muted-foreground">testnet · mock</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-background/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            L2Earn balance
          </p>
          {loading && balance === null ? (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <p className="mt-1 text-3xl font-black text-primary">
              {balance ?? "0.00"}{" "}
              <span className="text-base font-semibold text-foreground/60">dNZD</span>
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Earnings history
          </p>
          {txs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
              No campaigns completed yet. Earn your first dNZD on{" "}
              <a href="/campaigns" className="font-semibold text-primary underline-offset-4 hover:underline">
                Campaigns
              </a>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border/40 rounded-lg border border-border/40 bg-background/40">
              {txs.map((t) => (
                <li key={`${t.campaignId}-${t.ts}`} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-semibold">{t.campaignId}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.ts).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    +{(t.amountCents / 100).toFixed(2)} dNZD
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
