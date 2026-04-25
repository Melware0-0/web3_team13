"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/lib/wagmi-config";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

const metadata = {
  name: "Wallet Connector",
  description: "Connect your wallet using WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata,
  features: {
    analytics: true,
  },
});

export function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
