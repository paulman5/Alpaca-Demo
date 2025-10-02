"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAptosClient } from "./useAptosClient";
import { useAptosWallet } from "./useAptosWallet";

function formatAptFromOctas(octas: bigint): string {
  const OCTAS_IN_APT = BigInt(1_000_000_000);
  const whole = octas / OCTAS_IN_APT;
  const fraction = octas % OCTAS_IN_APT;
  const fractionStr = fraction.toString().padStart(9, "0").replace(/0+$/, "");
  return fractionStr.length ? `${whole.toString()}.${fractionStr}` : whole.toString();
}

export function useAptosBalance() {
  const { address, isConnected } = useAptosWallet();
  const client = useAptosClient();
  const [balanceOctas, setBalanceOctas] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const amount = await client.getAccountBalance(address);
      setBalanceOctas(amount);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [address, client]);

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    } else {
      setBalanceOctas(null);
      setError(null);
    }
  }, [isConnected, address, fetchBalance]);

  const balanceApt = useMemo(() => {
    return balanceOctas !== null ? formatAptFromOctas(balanceOctas) : null;
  }, [balanceOctas]);

  return { balanceOctas, balanceApt, isLoading, error, refetch: fetchBalance } as const;
}


