"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, Wallet, X } from "lucide-react";
import Image from "next/image";
import { useEnsAvatar, useEnsName } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/campaigns", label: "CAMPAIGNS" },
];

function WalletTrigger({
  mobile = false,
  onOpen,
}: {
  mobile?: boolean;
  onOpen?: () => void;
}) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount({ namespace: "eip155" });
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
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [address]);

  const label = ensName ?? shortAddress;

  const handleClick = async () => {
    await open({
      view: isConnected ? "Account" : "Connect",
      namespace: "eip155",
    });
    onOpen?.();
  };

  if (!isConnected) {
    return (
      <Button
        size="sm"
        className={mobile ? "w-full gap-2 font-semibold" : "gap-2 font-semibold"}
        onClick={handleClick}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={mobile
        ? "flex w-full items-center gap-3 rounded-full bg-white/18 px-3 py-2 text-left text-sm font-semibold text-white"
        : "flex items-center gap-3 rounded-full bg-white/18 px-3 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:bg-white/22"}
      title={address}
    >
      <Avatar className="h-10 w-10">
        {ensAvatar ? <AvatarImage src={ensAvatar} alt={ensName ?? "Wallet avatar"} /> : null}
        <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 via-violet-400 to-cyan-200 text-white">
          {(label || "WA").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span>{label}</span>
    </button>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <Image src="/l2earn-icon.svg" alt="L2Earn" width={40} height={40} className="h-full w-full object-contain" unoptimized priority />
          </span>
          <span className="hidden h-12 items-center rounded-md bg-white px-3 py-1.5 shadow-sm sm:flex">
            <Image src="/l2earn-logo-text.svg" alt="L2Earn" width={200} height={40} className="h-full w-auto object-contain" unoptimized priority />
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
            </Link>
          ))}
          <WalletTrigger />
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
                className="text-sm font-semibold text-foreground/70 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:bg-clip-text hover:text-transparent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <WalletTrigger mobile onOpen={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
