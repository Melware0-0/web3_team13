"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Copy,
  LogOut,
  Menu,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/campaigns", label: "CAMPAIGNS" },
];

const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectAsync, connectors } = useConnect();
  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
    query: { enabled: Boolean(ensName) },
  });

  const hasMetaMaskProvider = useMemo(() => {
    if (typeof window === "undefined" || !("ethereum" in window)) return false;
    const ethereum = (window as { ethereum?: any }).ethereum;
    if (!ethereum) return false;
    if (ethereum.isMetaMask) return true;
    if (Array.isArray(ethereum.providers)) {
      return ethereum.providers.some((provider: any) => provider?.isMetaMask);
    }
    return false;
  }, []);

  const metaMaskConnector = connectors.find(
    (connector) =>
      connector.id === "metaMask" ||
      /meta/i.test(connector.name) ||
      connector.id === "injected",
  );

  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";
  const triggerLabel = ensName ?? shortAddress;

  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      window.open(METAMASK_DOWNLOAD_URL, "_blank");
      return;
    }

    setIsLoading(true);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      if (metaMaskConnector) {
        await connectAsync({ connector: metaMaskConnector });
      }
    } catch (error: any) {
      if (error.code !== 4001) {
        console.error("Error connecting wallet:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openMetaMask = () => {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] }).catch(() => {});
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image src="/l2earn-icon.svg" alt="L2Earn" width={40} height={40} className="h-full w-full object-contain" unoptimized priority />
          </span>
          <span className="hidden sm:flex h-12 items-center rounded-md bg-white px-3 py-1.5 shadow-sm">
            <Image src="/l2earn-logo-text.svg" alt="L2Earn" width={200} height={40} className="h-full w-auto object-contain" unoptimized priority />
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 ease-out"></span>
            </Link>
          ))}
          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 rounded-full bg-white/18 px-3 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:bg-white/22"
                  title={address}
                >
                  <Avatar className="h-10 w-10">
                    {ensAvatar ? <AvatarImage src={ensAvatar} alt={ensName ?? "Wallet avatar"} /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 via-violet-400 to-cyan-200 text-white">
                      {triggerLabel.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{triggerLabel}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 rounded-3xl p-3">
                <div className="px-3 py-2">
                  <p className="text-base font-semibold">{ensName ?? shortAddress}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{address}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-2xl px-3 py-3 text-base" onClick={copyAddress}>
                  <Copy className="mr-3 h-5 w-5" />
                  {shortAddress}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-2xl px-3 py-3 text-base text-red-500 focus:text-red-500"
                  onClick={() => disconnect()}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="gap-2 font-semibold"
              onClick={connectWallet}
              disabled={isLoading}
            >
              <Wallet className="h-4 w-4" />
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-primary/10 bg-gradient-to-b from-background/95 to-background md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-foreground/70 hover:text-transparent hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:bg-clip-text transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isConnected && address ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <button
                  className="flex w-full items-center gap-3 rounded-full bg-white/18 px-3 py-2 text-left text-sm font-semibold text-white"
                  onClick={() => {
                    openMetaMask();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    {ensAvatar ? <AvatarImage src={ensAvatar} alt={ensName ?? "Wallet avatar"} /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 via-violet-400 to-cyan-200 text-white">
                      {triggerLabel.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{triggerLabel}</span>
                </button>
                <div className="mt-3 rounded-2xl border border-white/10">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
                    onClick={async () => {
                      await copyAddress();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    {shortAddress}
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500"
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="w-full gap-2 font-semibold"
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoading}
              >
                <Wallet className="h-4 w-4" />
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
