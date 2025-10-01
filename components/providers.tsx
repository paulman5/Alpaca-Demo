"use client";

import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { toast } from "sonner";
import { useAptosWallet } from "@/hooks/aptos/useAptosWallet";

const queryClient = new QueryClient();

// EVM providers removed; Aptos-only app

function AptosWalletConnectionPrompt() {
  const { isConnected, connect } = useAptosWallet();

  useEffect(() => {
    if (!isConnected) {
      toast("Aptos wallet not connected", {
        description: "Please connect your Aptos wallet to continue.",
        action: {
          label: "Connect Aptos Wallet",
          onClick: connect,
        },
        duration: Infinity,
      });
    }
  }, [isConnected, connect]);

  return null;
}

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AptosWalletConnectionPrompt />
      {children}
    </AuthProvider>
  </QueryClientProvider>
);

export { Providers };
