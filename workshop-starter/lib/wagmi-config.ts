/**
 * WORKSHOP: Wagmi Configuration
 * 
 * This file sets up the connection to blockchain networks using Wagmi and Reown AppKit.
 * 
 * Key concepts:
 * - WagmiAdapter: Connects Reown AppKit to Wagmi for wallet interactions
 * - Networks: Define which blockchain networks your app supports
 * - Storage: Use cookies for SSR (Server-Side Rendering) support
 * - Transports: HTTP connections to blockchain nodes
 */

import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, polygon, optimism, base } from "@reown/appkit/networks";

// STEP 1: Get the WalletConnect Project ID from environment variables
// You can get a free project ID at https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

// STEP 2: Define the networks your app will support
// These are the blockchain networks users can connect to
// TODO: Create an array of networks you want to support
// Hint: Import networks from "@reown/appkit/networks"
export const networks = [
  // Add networks here (e.g., mainnet, arbitrum, polygon, optimism, base)
];

// STEP 3: Create the Wagmi Adapter
// This adapter connects Reown AppKit to Wagmi
// TODO: Create a new WagmiAdapter with the following configuration:
// - storage: Use createStorage with cookieStorage for SSR support
// - ssr: Set to true for Next.js SSR support
// - projectId: Your WalletConnect project ID
// - networks: The networks array you defined above
// - transports: HTTP transports for each network

export const wagmiAdapter = new WagmiAdapter({
  // TODO: Add configuration here
  // storage: createStorage({ storage: cookieStorage }),
  // ssr: ???,
  // projectId: ???,
  // networks: ???,
  // transports: {
  //   [mainnet.id]: http(),
  //   ... add more for each network
  // },
});

// Export the wagmi config for use in the provider
export const config = wagmiAdapter.wagmiConfig;
