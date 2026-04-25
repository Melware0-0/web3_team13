"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useReconnect,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";

const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const connectLockRef = useRef(false);
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { connectAsync, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { reconnectAsync } = useReconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && mounted) {
      router.replace("/campaigns");
    }
  }, [isConnected, mounted, router]);

  useEffect(() => {
    if (!mounted) return;

    const removeWalletModal = () => {
      document
        .querySelectorAll("w3m-modal, w3m-router-container, wui-modal, w3m-account-modal, w3m-connect-modal")
        .forEach((node) => node.remove());
    };

    removeWalletModal();
    const observer = new MutationObserver(removeWalletModal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [mounted]);

  useEffect(() => {
    if (!awaitingApproval || !mounted) return;

    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const ethereum = (window as { ethereum?: any }).ethereum;
        if (!ethereum?.request) return;
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (!cancelled && Array.isArray(accounts) && accounts.length > 0) {
          await reconnectAsync();
          setAwaitingApproval(false);
          setLocalError(null);
        }
      } catch {
        // Ignore polling errors while waiting for user approval in extension.
      }
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [awaitingApproval, mounted, reconnectAsync]);

  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  const hasMetaMaskProvider = useMemo(() => {
    if (!mounted || !("ethereum" in window)) return false;
    const ethereum = (window as { ethereum?: any }).ethereum;
    if (!ethereum) return false;
    if (ethereum.isMetaMask) return true;
    if (Array.isArray(ethereum.providers)) {
      return ethereum.providers.some((provider: any) => provider?.isMetaMask);
    }
    return false;
  }, [mounted]);

  const metaMaskConnector = connectors.find(
    (connector) =>
      connector.id === "metaMask" ||
      /meta/i.test(connector.name) ||
      connector.id === "injected",
  );

  const connectHint = useMemo(() => {
    if (!mounted) return null;
    if (localError) return localError;
    if (connectError?.message) return connectError.message;
    if (!hasMetaMaskProvider) return "MetaMask is not detected in this browser.";
    if (!metaMaskConnector) return "MetaMask connector is not available in this browser profile.";
    return null;
  }, [connectError?.message, hasMetaMaskProvider, localError, metaMaskConnector, mounted]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://sepolia.basescan.org/address/${address}`, "_blank");
    }
  };

  const connectBrowserMetaMask = async () => {
    if (isConnecting || awaitingApproval || isRequesting || connectLockRef.current) return;
    connectLockRef.current = true;
    setIsRequesting(true);
    setLocalError(null);

    try {
      if (!hasMetaMaskProvider) {
        window.location.assign(METAMASK_DOWNLOAD_URL);
        return;
      }

      const ethereum = (window as { ethereum?: any }).ethereum;
      const metaMaskProvider = Array.isArray(ethereum?.providers)
        ? ethereum.providers.find((provider: any) => provider?.isMetaMask)
        : ethereum;

      if (!metaMaskProvider?.isMetaMask) {
        window.location.assign(METAMASK_DOWNLOAD_URL);
        return;
      }

      // This is the most direct way to trigger MetaMask's account approval popup.
      await metaMaskProvider.request({ method: "eth_requestAccounts" });

      if (!metaMaskConnector) {
        setLocalError("MetaMask was detected, but connector was unavailable. Reload and try again.");
        return;
      }

      await connectAsync({ connector: metaMaskConnector });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/already pending|requestPermissions.*pending|wallet_requestPermissions.*pending/i.test(message)) {
        setAwaitingApproval(true);
        setLocalError("MetaMask approval is already pending. Open MetaMask and approve or reject the request first.");
        return;
      }
      if (/provider not found/i.test(message)) {
        window.location.assign(METAMASK_DOWNLOAD_URL);
        return;
      }
      setLocalError(message);
    } finally {
      connectLockRef.current = false;
      setIsRequesting(false);
    }
  };

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
          <Button
            onClick={connectBrowserMetaMask}
            size="lg"
            className="w-full gap-2"
            disabled={isConnecting || isRequesting || awaitingApproval}
          >
            <Wallet className="h-5 w-5" />
            {awaitingApproval
              ? "Awaiting MetaMask approval..."
              : isRequesting
                ? "Opening MetaMask..."
                : hasMetaMaskProvider
                  ? "Connect MetaMask"
                  : "Install MetaMask"}
          </Button>
          {!hasMetaMaskProvider ? (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full"
            >
              <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                Download MetaMask Extension
              </a>
            </Button>
          ) : null}
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
              <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
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
          <div className="flex items-start justify-between gap-3">
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
