import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/demo"),
});

export function useEns(address?: string) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      setEnsAvatar(null);
      return;
    }

    const resolveEns = async () => {
      setLoading(true);
      try {
        const name = await publicClient.getEnsName({
          address: address as `0x${string}`,
        });

        if (name) {
          setEnsName(name);

          try {
            const avatar = await publicClient.getEnsAvatar({
              name,
            });
            if (avatar) {
              setEnsAvatar(avatar);
            }
          } catch {
            // Avatar resolution failed, continue without it
          }
        }
      } catch (error) {
        console.error("ENS resolution error:", error);
      } finally {
        setLoading(false);
      }
    };

    resolveEns();
  }, [address]);

  return { ensName, ensAvatar, loading };
}

export function formatAddress(address: string, ensName?: string | null) {
  if (ensName) return ensName;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
