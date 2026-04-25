"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Wallet } from "lucide-react";
import Image from "next/image";
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
          {walletAddress ? (
            <Button
              size="sm"
              className="gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={openMetaMask}
              title={walletAddress}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
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
            {walletAddress ? (
              <Button
                size="sm"
                className="w-full gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300"
                onClick={() => {
                  openMetaMask();
                  setMobileMenuOpen(false);
                }}
                title={walletAddress}
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
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
