/**
 * WORKSHOP: Wallet Page
 * 
 * This is the page where users connect their wallet.
 * It demonstrates how to use the Web3Provider with Next.js App Router.
 * 
 * Key concepts:
 * - Server Components vs Client Components
 * - Passing cookies from server to client for SSR support
 * - Using the Web3Provider to wrap client components
 */

import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Web3Provider } from "@/components/web3-provider";
import { WalletConnector } from "@/components/wallet-connector";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Connect Wallet | WDCC x Web3UOA",
  description: "Connect your MetaMask or other Web3 wallet to get started",
};

// This is a Server Component by default in Next.js App Router
export default async function WalletPage() {
  // STEP 1: Get cookies from the request headers
  // This is needed for SSR support - it allows us to restore the wallet
  // connection state on page load
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  // STEP 2: Wrap the page content with Web3Provider
  // Pass the cookies to the provider for SSR hydration
  // TODO: Make sure Web3Provider is properly implemented in components/web3-provider.tsx

  return (
    <Web3Provider cookies={cookies}>
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
                Connect Your Wallet
              </h1>
              <p className="text-muted-foreground">
                Connect your MetaMask or other Web3 wallet to interact with decentralized
                applications and explore the world of Web3.
              </p>
            </div>

            {/* STEP 3: The WalletConnector component handles the UI */}
            {/* Make sure it's properly implemented in components/wallet-connector.tsx */}
            <WalletConnector />

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
