"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/campaigns", label: "CAMPAIGNS" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const metaMaskDownloadUrl = "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn";
  const metaMaskExtensionUrl = "chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html";

  type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string }) => Promise<unknown>;
  };

  const getMetaMaskProvider = (): MetaMaskProvider | null => {
    const eth = (window as Window & {
      ethereum?: MetaMaskProvider & { providers?: MetaMaskProvider[] };
    }).ethereum;

    if (!eth) return null;
    if (Array.isArray(eth.providers)) {
      const provider = eth.providers.find((provider) => provider?.isMetaMask);
      return provider ?? null;
    }
    return eth.isMetaMask ? eth : null;
  };

  const openMetaMaskExtension = () => {
    const tab = window.open(metaMaskExtensionUrl, "_blank", "noopener,noreferrer");
    if (!tab) {
      window.open(metaMaskDownloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  const connectMetaMask = async () => {
    const metaMaskProvider = getMetaMaskProvider();
    if (!metaMaskProvider) {
      window.open(metaMaskDownloadUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      await metaMaskProvider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === -32002
      ) {
        openMetaMaskExtension();
        return;
      }
      window.open(metaMaskDownloadUrl, "_blank", "noopener,noreferrer");
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
          <Button
            size="sm"
            onClick={connectMetaMask}
            className="gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Wallet className="h-4 w-4" />
            Connect
          </Button>
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
            <Button
              size="sm"
              onClick={async () => {
                setMobileMenuOpen(false);
                await connectMetaMask();
              }}
              className="w-full gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
