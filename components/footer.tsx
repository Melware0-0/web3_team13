import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer id="resources" className="border-t border-border/40 bg-background py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              L2Earn
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Learn-to-Earn for the Great Handover. Built on NewMoney stablecoin
              infrastructure. Made by builders for builders.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/campaigns" className="transition-colors hover:text-foreground">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="transition-colors hover:text-foreground">
                  Wallet
                </Link>
              </li>
              <li>
                <Link href="/agent-campaigns.json" className="transition-colors hover:text-foreground">
                  Agent Feed (JSON)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
              Built With
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://getnew.money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  NewMoney (dNZD / dAUD)
                </a>
              </li>
              <li>
                <a
                  href="https://reown.com/appkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Reown AppKit
                </a>
              </li>
              <li>
                <a
                  href="https://www.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Anthropic Claude
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} L2Earn · Web3NZ Hackathon Team 13. Demo only — not a
            financial product. dNZD shown is testnet/mock for the hackathon.
          </p>
        </div>
      </div>
    </footer>
  );
}
