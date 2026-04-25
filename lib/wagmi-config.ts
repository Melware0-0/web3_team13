import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import {
  mainnet,
  arbitrum,
  polygon,
  optimism,
  base,
  baseSepolia,
} from "@reown/appkit/networks";

// Soft fallback so dev still boots without a project ID.
// Production should always set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
const envProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!envProjectId && typeof window === "undefined") {
  console.warn(
    "[L2Earn] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — wallet modal will fail to open. " +
      "Get a free ID at https://walletconnect.network and add it to .env.local.",
  );
}
export const projectId = envProjectId ?? "DEMO_NO_PROJECT_ID";

export const networks = [base, baseSepolia, mainnet, arbitrum, polygon, optimism] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  projectId,
  networks,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;
