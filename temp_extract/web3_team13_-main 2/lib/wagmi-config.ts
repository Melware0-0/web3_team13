import { cookieStorage, createStorage } from "wagmi";
import { mainnet, arbitrum, polygon, optimism, base, baseSepolia } from "wagmi/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const networks = [base, baseSepolia, mainnet, arbitrum, polygon, optimism];
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }) as any,
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;