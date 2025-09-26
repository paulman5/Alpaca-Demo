"use client";

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    aptos?: {
      account(): Promise<{ address: string }>;
      connect(): Promise<{ address: string }>;
      signAndSubmitTransaction(tx: any): Promise<{ hash: string }>;
      signTransaction?(tx: any): Promise<any>;
      network?: () => Promise<{ name: string }>;
    };
  }
}

export function useAptosWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    if (!window?.aptos) throw new Error("Aptos wallet not found");
    const { address } = await window.aptos.connect();
    setAddress(address);
    setIsConnected(true);
    return address;
  }, []);

  const getAccount = useCallback(async () => {
    if (!window?.aptos) return null;
    try {
      const { address } = await window.aptos.account();
      setAddress(address);
      setIsConnected(true);
      return address;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    getAccount();
  }, [getAccount]);

  const signAndSubmit = useCallback(async (tx: any) => {
    if (!window?.aptos) throw new Error("Aptos wallet not found");
    return window.aptos.signAndSubmitTransaction(tx);
  }, []);

  return { address, isConnected, connect, signAndSubmit } as const;
}



