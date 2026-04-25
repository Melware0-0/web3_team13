import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Web3Provider } from "@/components/web3-provider";
import { WalletConnector } from "@/components/wallet-connector";
import { DnzdBalance } from "@/components/dnzd-balance";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Wallet | L2Earn",
  description: "Connect a wallet, view your dNZD balance, and see your earnings history.",
};

export default function WalletPage() {
  return (
    <Web3Provider>
      <Navbar />
      <main className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Your Wallet
              </h1>
              <p className="text-muted-foreground">
                Connect MetaMask, Coinbase Wallet, or any WalletConnect-supported wallet. We use
                your address as your identity for dNZD payouts.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <WalletConnector />
              <DnzdBalance />
            </div>

            <div className="mt-12 rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-card-foreground">
                New to Web3?
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                A Web3 wallet is your gateway to the decentralized internet. It allows you
                to securely store digital assets, interact with decentralized applications
                (dApps), and manage your blockchain identity.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <p>
                    <strong className="text-card-foreground">Install MetaMask</strong> - Download the
                    MetaMask browser extension from{" "}
                    <a
                      href="https://metamask.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      metamask.io
                    </a>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  <p>
                    <strong className="text-card-foreground">Create a wallet</strong> - Follow the
                    setup wizard to create your wallet and secure your recovery phrase
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  <p>
                    <strong className="text-card-foreground">Connect</strong> - Click the connect
                    button above and approve the connection in MetaMask
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Web3Provider>
  );
}
