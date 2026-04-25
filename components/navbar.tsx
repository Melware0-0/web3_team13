"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/campaigns", label: "CAMPAIGNS" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window === "undefined") return;
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    };

    checkWalletConnection();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      window.open("https://metamask.io/download.html", "_blank");
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] }).catch(() => {});
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          L2Earn
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {walletAddress ? (
            <Button
              size="sm"
              className="gap-2 font-semibold"
              onClick={openMetaMask}
              variant="outline"
            >
              <Wallet className="h-4 w-4" />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Button>
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
        <div className="border-t border-border/40 bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {walletAddress ? (
              <Button
                size="sm"
                className="w-full gap-2 font-semibold"
                onClick={() => {
                  openMetaMask();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
              >
                <Wallet className="h-4 w-4" />
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </Button>
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
