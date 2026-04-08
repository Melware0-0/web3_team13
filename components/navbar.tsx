"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "#about", label: "ABOUT" },
  { href: "#resources", label: "RESOURCES" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-xl font-bold text-primary-foreground">
          WDCC x Web3UOA
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/wallet">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-primary-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary md:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
