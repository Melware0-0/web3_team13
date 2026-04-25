import { createAppKit } from "@reown/appkit";
import { wagmiAdapter } from "./wagmi-config";
import { base, baseSepolia, mainnet, arbitrum, polygon, optimism } from "wagmi/chains";

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  networks: [base, baseSepolia, mainnet, arbitrum, polygon, optimism],
  defaultNetwork: base,
  metadata: {
    name: "L2Earn",
    description: "Learn-to-Earn for the Great Handover",
    url: "https://l2earn.xyz",
    icons: ["/l2earn-icon.svg"],
  },
});
