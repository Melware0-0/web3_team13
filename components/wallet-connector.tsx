"use client";

import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react";

export function WalletConnector() {
  const { open } = useAppKit();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { caipNetwork, chainId } = useAppKitNetwork();

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const openExplorer = () => {
    if (address && caipNetwork?.blockExplorers?.default?.url) {
      window.open(`${caipNetwork.blockExplorers.default.url}/address/${address}`, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect with MetaMask or other wallets via WalletConnect
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => open()} size="lg" className="w-full gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By connecting, you agree to the terms of service
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Connected</CardTitle>
              <CardDescription className="text-xs">
                {caipNetwork?.name || "Unknown Network"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => open({ view: "Networks" })}
            className="gap-1"
          >
            Switch
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Wallet Address</p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono">{address ? truncateAddress(address) : ""}</code>
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openExplorer}
                title="View on explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">
            {balance
              ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
              : "Loading..."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Network</p>
            <p className="truncate text-sm font-medium">{caipNetwork?.name || "Unknown"}</p>
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
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => open({ view: "Account" })}
          >
            <Wallet className="h-4 w-4" />
            Account
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => open({ view: "Account" })}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
