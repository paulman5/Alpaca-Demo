"use client";

import { useCallback, useEffect, useState } from "react";
import { useAptosClient } from "../../aptos/useAptosClient";
import { APTOS_MODULE } from "@/lib/aptos";

export function useAptosBalance(ownerAddress: string | undefined) {
  const client = useAptosClient();
  const [data, setData] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!ownerAddress) return { data: undefined } as const;
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        function: `${APTOS_MODULE}::balance`,
        type_arguments: [],
        arguments: [ownerAddress],
      };
      const [balance] = await client.view(payload);
      setData(Number(balance || 0));
      return { data: balance } as const;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch balance");
      return { data: undefined } as const;
    } finally {
      setIsLoading(false);
    }
  }, [client, ownerAddress]);

  useEffect(() => {
    if (ownerAddress) {
      refetch();
    }
  }, [ownerAddress, refetch]);

  return { balance: data, isLoading, error, refetch } as const;
}
