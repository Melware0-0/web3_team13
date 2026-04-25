import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
} from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

const metadata = {
  name: "L2Earn",
  description: "Learn-to-earn campaigns with wallet rewards on Base.",
  url: appUrl,
  icons: [`${appUrl}/icon-light-32x32.png`],
};

export const networks = [base, baseSepolia, mainnet, arbitrum, polygon, optimism] as const;

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: [...networks],
});

export const config = wagmiAdapter.wagmiConfig;

const reownGlobal = globalThis as typeof globalThis & { __l2earnAppKitInitialized?: boolean };

if (!reownGlobal.__l2earnAppKitInitialized) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [...networks],
    metadata,
    themeMode: "dark",
    features: {
      analytics: true,
    },
    themeVariables: {
      "--apkt-accent": "#ffd21f",
      "--apkt-color-mix": "#170035",
      "--apkt-color-mix-strength": 30,
      "--apkt-border-radius-master": "20px",
      "--apkt-font-family": '"DM Sans", sans-serif',
      "--apkt-z-index": 1000,
    },
  });

  reownGlobal.__l2earnAppKitInitialized = true;
}
