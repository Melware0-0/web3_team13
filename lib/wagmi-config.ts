import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, arbitrum, polygon, optimism, base, baseSepolia } from "wagmi/chains";

export const config = createConfig({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  chains: [base, baseSepolia, mainnet, arbitrum, polygon, optimism],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});
