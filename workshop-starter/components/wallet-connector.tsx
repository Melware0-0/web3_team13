/**
 * WORKSHOP: Wallet Connector Component
 * 
 * This component displays the wallet connection UI and wallet information.
 * It uses hooks from Reown AppKit and Wagmi to:
 * - Check if a wallet is connected
 * - Get the connected wallet address
 * - Get the wallet balance
 * - Get network information
 * - Open the connection/account modal
 * 
 * Key hooks:
 * - useAppKit(): Opens the wallet modal { open }
 * - useAppKitAccount(): Gets account info { address, isConnected, status }
 * - useAppKitNetwork(): Gets network info { caipNetwork, chainId }
 * - useBalance(): Gets the wallet balance (from wagmi)
 */

"use client";

// STEP 1: Import the necessary hooks
// TODO: Import these hooks:
// - useAppKit, useAppKitAccount, useAppKitNetwork from "@reown/appkit/react"
// - useBalance from "wagmi"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react";

export function WalletConnector() {
  // STEP 2: Use the AppKit hooks to get wallet state
  // TODO: Destructure the following from the hooks:
  // const { open } = useAppKit();
  // const { address, isConnected, status } = useAppKitAccount();
  // const { caipNetwork, chainId } = useAppKitNetwork();

  // Placeholder values - replace with actual hook values
  const open = () => console.log("TODO: Implement useAppKit hook");
  const address = undefined;
  const isConnected = false;
  const status = "disconnected";
  const caipNetwork = undefined;
  const chainId = undefined;

  // STEP 3: Use the useBalance hook from wagmi to get the wallet balance
  // TODO: Call useBalance with the connected address
  // const { data: balance } = useBalance({
  //   address: address as `0x${string}` | undefined,
  // });
  const balance = undefined;

  // Helper function to truncate address for display
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper function to copy address to clipboard
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  // Helper function to open block explorer
  const openExplorer = () => {
    if (address && caipNetwork?.blockExplorers?.default?.url) {
      window.open(
        `${caipNetwork.blockExplorers.default.url}/address/${address}`,
        "_blank"
      );
    }
  };

  // STEP 4: Render different UI based on connection state
  // When not connected: Show a "Connect Wallet" button
  // When connected: Show wallet info (address, balance, network)

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
          {/* TODO: Add onClick handler to open the wallet modal */}
          {/* Hint: Call open() from useAppKit */}
          <Button
            onClick={() => {
              // TODO: Call open() to show the wallet connection modal
              open();
            }}
            size="lg"
            className="w-full gap-2"
          >
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

  // Connected state - show wallet information
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
              <CardDescription className="text-xs">
                {/* TODO: Display the network name */}
                {caipNetwork?.name || "Unknown Network"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open the network switcher
              // Hint: open({ view: "Networks" })
            }}
            className="gap-1"
          >
            Switch
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address Section */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Wallet Address
          </p>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono">
              {/* TODO: Display truncated address */}
              {address ? truncateAddress(address) : ""}
            </code>
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

        {/* Balance Section */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Balance
          </p>
          <p className="text-2xl font-bold">
            {/* TODO: Display formatted balance */}
            {/* Hint: balance?.formatted and balance?.symbol */}
            {balance
              ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
              : "Loading..."}
          </p>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Network
            </p>
            <p className="text-sm font-medium truncate">
              {caipNetwork?.name || "Unknown"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Chain ID
            </p>
            <p className="text-sm font-medium">{chainId || "N/A"}</p>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Connection Status
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-sm font-medium capitalize">{status}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              // TODO: Open account view
              // Hint: open({ view: "Account" })
            }}
          >
            <Wallet className="h-4 w-4" />
            Account
          </Button>
          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={() => {
              // TODO: Open account view to disconnect
              // Hint: open({ view: "Account" })
            }}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
