"use client";

import Image from "next/image";
import { useEns } from "@/lib/useEns";
import { Wallet } from "lucide-react";

interface EnsDisplayProps {
  address: string;
  showAvatar?: boolean;
  truncate?: boolean;
  className?: string;
}

export function EnsDisplay({
  address,
  showAvatar = true,
  truncate = true,
  className = "",
}: EnsDisplayProps) {
  const { ensName, ensAvatar } = useEns(address);

  const displayText = ensName || (truncate ? `${address.slice(0, 6)}...${address.slice(-4)}` : address);

  return (
    <div className={`flex items-center gap-2 ${className}`} title={address}>
      {showAvatar && ensAvatar ? (
        <Image
          src={ensAvatar}
          alt="ENS Avatar"
          width={24}
          height={24}
          className="h-6 w-6 rounded-full"
        />
      ) : showAvatar ? (
        <Wallet className="h-5 w-5" />
      ) : null}
      <span className="break-all font-mono text-sm">{displayText}</span>
    </div>
  );
}
