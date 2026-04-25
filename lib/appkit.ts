import { createAppKit } from "@reown/appkit";
import { wagmiAdapter } from "./wagmi-config";
import { base, baseSepolia, mainnet, arbitrum, polygon, optimism } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "a41aac09eb6ec89bd5fcc066c0dcb4c9";

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, baseSepolia, mainnet, arbitrum, polygon, optimism],
  defaultNetwork: base,
  metadata: {
    name: "L2Earn",
    description: "Learn-to-Earn for the Great Handover",
    url: typeof window !== "undefined" ? window.location.origin : "https://l2earn.xyz",
    icons: ["/l2earn-icon.svg"],
  },
  features: {
    analytics: false,
  },
});
