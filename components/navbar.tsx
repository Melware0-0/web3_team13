"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnsDisplay } from "@/components/ens-display";
import { modal } from "@/lib/appkit";
import { useAccount } from "wagmi";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/campaigns", label: "CAMPAIGNS" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/profile", label: "PROFILE" },
  { href: "/how-it-works", label: "HOW IT WORKS" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { address: walletAddress } = useAccount();

  useEffect(() => setMounted(true), []);

  const connectButton = (
    <button type="button" onClick={() => modal.open()}>
      {mounted && walletAddress ? (
        <EnsDisplay address={walletAddress} showAvatar showBadge className="flex-row" />
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect
        </>
      )}
    </button>
  );

  const connectButtonMobile = (
    <button
      type="button"
      onClick={() => {
        setMobileMenuOpen(false);
        modal.open();
      }}
    >
      {mounted && walletAddress ? (
        <EnsDisplay address={walletAddress} showAvatar showBadge className="flex-row" />
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image src="/l2earn-icon.svg" alt="L2Earn" width={40} height={40} className="h-full w-full object-contain" unoptimized priority />
          </span>
          <span className="hidden sm:block text-2xl font-black tracking-tight" style={{ color: '#a78bfa' }}>
            L<span style={{ color: '#F5C518' }}>2</span>EARN
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
            asChild
            size="sm"
            className="gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {connectButton}
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
              asChild
              size="sm"
              className="w-full gap-2 font-semibold bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              {connectButtonMobile}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
