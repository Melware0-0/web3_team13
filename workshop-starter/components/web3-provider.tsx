/**
 * WORKSHOP: Web3 Provider Component
 * 
 * This component wraps your app with the necessary providers for Web3 functionality:
 * - WagmiProvider: Provides wallet connection state and hooks
 * - QueryClientProvider: Required for data fetching (used by Wagmi internally)
 * - AppKit: The Reown AppKit that handles the wallet connection modal
 * 
 * Key concepts:
 * - Providers wrap your app to provide context/state to all child components
 * - SSR support requires special handling of initial state from cookies
 */

"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { wagmiAdapter, projectId, networks } from "@/lib/wagmi-config";

// Create a QueryClient for React Query (required by Wagmi)
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// STEP 1: Define metadata for your app
// This information is shown to users when they connect their wallet
const metadata = {
  name: "WDCC x Web3UOA Workshop",
  description: "Learn to connect wallets with WalletConnect",
  url: typeof window !== "undefined" ? window.location.origin : "https://example.com",
  icons: ["/icon.svg"],
};

// STEP 2: Initialize AppKit
// This creates the wallet connection modal and configures it
// TODO: Call createAppKit with the following configuration:
// - adapters: Array containing wagmiAdapter
// - projectId: Your WalletConnect project ID
// - networks: The supported networks
// - defaultNetwork: The default network (usually networks[0])
// - metadata: The metadata object defined above
// - features: Optional features like analytics

// createAppKit({
//   adapters: ???,
//   projectId: ???,
//   networks: ???,
//   defaultNetwork: ???,
//   metadata: ???,
//   features: {
//     analytics: true,
//   },
// });

// STEP 3: Create the Web3Provider component
// This component wraps the app with WagmiProvider and QueryClientProvider
export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  // TODO: Parse the initial state from cookies for SSR support
  // Hint: Use cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  const initialState = undefined; // Replace with actual implementation

  // TODO: Return the providers wrapping the children
  // Structure:
  // <WagmiProvider config={...} initialState={...}>
  //   <QueryClientProvider client={...}>
  //     {children}
  //   </QueryClientProvider>
  // </WagmiProvider>
  
  return (
    <div>
      {/* TODO: Replace this with proper providers */}
      {children}
    </div>
  );
}
