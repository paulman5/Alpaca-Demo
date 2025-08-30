"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNetworkSwitch } from "@/hooks/use-network-switch";
import { toast } from "sonner";

interface NetworkContextType {
  isPharos: boolean;
  currentChain: number | undefined;
  checkAndSwitchNetwork: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isConnected } = useAccount();
  const { checkAndSwitchNetwork, isPharos, currentChain } = useNetworkSwitch();

  // Automatically switch to Pharos when wallet connects
  useEffect(() => {
    if (isConnected) {
      checkAndSwitchNetwork().catch((error) => {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch to Pharos network");
      });
    }
  }, [isConnected, checkAndSwitchNetwork]);

  const value: NetworkContextType = {
    isPharos,
    currentChain,
    checkAndSwitchNetwork,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
