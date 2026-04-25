"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { config } from "@/lib/wagmi-config";

const queryClient = new QueryClient();

export function Web3Provider({
  children,
}: {
  children: ReactNode;
}) {
  const initialState = cookieToInitialState(config as Config);

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
