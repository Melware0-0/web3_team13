"use client";

import { useMemo } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useAccount, useBalance, useChainId, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, LogOut, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WalletConnector() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
  const { status } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
  });
  const { data: ensName } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
    query: { enabled: Boolean(ensName) },
  });

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const displayName = ensName ?? shortAddress;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const openExplorer = () => {
    if (!address) return;
    window.open(`https://sepolia.basescan.org/address/${address}`, "_blank", "noopener,noreferrer");
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Connect your wallet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={() => open({ view: "Connect", namespace: "eip155" })}
            size="lg"
            className="w-full gap-2"
          >
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Use Reown to connect MetaMask, WalletConnect, Coinbase Wallet, or another EVM wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {ensAvatar ? <AvatarImage src={ensAvatar} alt={ensName ?? "Wallet avatar"} /> : null}
              <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 via-violet-400 to-cyan-200 text-white">
                {(displayName || "WA").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <p className="text-xs text-muted-foreground">Connected wallet</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => open({ view: "Account", namespace: "eip155" })}>
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Wallet Address</p>
          <div className="flex items-start justify-between gap-3">
            <code className="text-sm font-mono">{address}</code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => address && copyToClipboard(address)}
                title="Copy address"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={openExplorer} title="View on explorer">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "Loading..."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Network</p>
            <p className="text-sm font-medium">EVM</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Chain ID</p>
            <p className="text-sm font-medium">{chainId || "N/A"}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Connection Status</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium capitalize">{status}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => open({ view: "Account", namespace: "eip155" })}>
            Open account modal
          </Button>
          <Button variant="destructive" className="flex-1 gap-2" onClick={() => disconnect()}>
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
