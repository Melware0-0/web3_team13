"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useBalance, useConnect, useDisconnect, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";

function MetaMaskLogo() {
  return (
    <svg viewBox="0 0 212 189" aria-hidden="true" className="h-14 w-14">
      <polygon fill="#E2761B" points="106,10 43,55 55,25" />
      <polygon fill="#E4761B" points="106,10 169,55 157,25" />
      <polygon fill="#E4761B" points="62,120 88,176 30,140" />
      <polygon fill="#E4761B" points="150,120 182,140 124,176" />
      <polygon fill="#E4761B" points="106,70 74,103 86,132 106,120 126,132 138,103" />
      <polygon fill="#F6851B" points="106,120 106,149 86,132" />
      <polygon fill="#F6851B" points="106,149 106,120 126,132" />
      <polygon fill="#C0AD9E" points="88,176 106,160 124,176 106,189" />
      <polygon fill="#CD6116" points="43,55 74,103 62,120" />
      <polygon fill="#CD6116" points="169,55 150,120 138,103" />
    </svg>
  );
}

export function WalletConnector() {
  const [mounted, setMounted] = useState(false);
  const [autoConnectTriggered, setAutoConnectTriggered] = useState(false);
  const [autoConnectRedirected, setAutoConnectRedirected] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  const hasBrowserProvider = mounted && "ethereum" in window;
  const metaMaskConnector = connectors.find(
    (connector) =>
      connector.id === "metaMask" ||
      /meta/i.test(connector.name) ||
      connector.id === "injected",
  );
  const connectHint = useMemo(() => {
    if (!mounted) return null;
    if (connectError?.message) return connectError.message;
    if (!hasBrowserProvider) return "MetaMask is not detected in this browser.";
    if (!metaMaskConnector) return "MetaMask connector is not available in this browser profile.";
    return null;
  }, [connectError?.message, hasBrowserProvider, metaMaskConnector, mounted]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://sepolia.basescan.org/address/${address}`, "_blank");
    }
  };

  const connectBrowserMetaMask = useCallback(async () => {
    if (!hasBrowserProvider) {
      window.alert("MetaMask is not detected. Redirecting to install page.");
      window.location.assign("https://metamask.io/download/");
      return;
    }

    if (!metaMaskConnector) {
      window.alert("MetaMask connector is not available in this browser profile.");
      return;
    }

    try {
      await connectAsync({ connector: metaMaskConnector });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === -32002
      ) {
        window.alert("MetaMask already has a pending request. Open the extension and approve it.");
        return;
      }

      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "MetaMask connection failed. Please open MetaMask and try again.";

      window.alert(message);
    }
  }, [connectAsync, hasBrowserProvider, metaMaskConnector]);

  useEffect(() => {
    if (!mounted || isConnected || autoConnectTriggered || isConnecting) return;
    const shouldAutoConnect = searchParams.get("autoconnect") === "1";
    if (!shouldAutoConnect) return;

    setAutoConnectTriggered(true);
    void connectBrowserMetaMask();
  }, [autoConnectTriggered, connectBrowserMetaMask, isConnected, isConnecting, mounted, searchParams]);

  useEffect(() => {
    if (!mounted || !isConnected || autoConnectRedirected) return;
    if (searchParams.get("autoconnect") !== "1") return;

    const returnTo = searchParams.get("returnTo");
    if (returnTo && returnTo.startsWith("/")) {
      setAutoConnectRedirected(true);
      router.replace(returnTo);
    }
  }, [autoConnectRedirected, isConnected, mounted, router, searchParams]);

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <MetaMaskLogo />
          </div>
          <CardTitle className="text-2xl">MetaMask</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={connectBrowserMetaMask} size="lg" className="w-full gap-2" disabled={isConnecting}>
            <Wallet className="h-5 w-5" />
            Connect MetaMask
          </Button>
          {connectHint ? <p className="text-center text-xs text-muted-foreground">{connectHint}</p> : null}
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
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg">Connected</CardTitle>
              <p className="text-xs text-muted-foreground">MetaMask</p>
            </div>
          </div>
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
          <Button variant="destructive" className="flex-1 gap-2" onClick={() => disconnect()}>
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
