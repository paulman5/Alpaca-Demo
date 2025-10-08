"use client";

import { useCallback, useEffect, useState } from "react";
import { useAptosClient } from "../../aptos/useAptosClient";
import { APTOS_KYC_MODULE, APTOS_PUBLISHER_ADDRESS } from "@/lib/aptos";

type HexAddress = string;

export function useIsKycVerified(
  user: HexAddress | undefined,
  registryAdmin: HexAddress = APTOS_PUBLISHER_ADDRESS,
) {
  const client = useAptosClient();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return { data: undefined } as const;
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        function: `${APTOS_KYC_MODULE}::is_verified`,
        type_arguments: [],
        arguments: [registryAdmin, user],
      } as any;
      const [res] = await client.view(payload);
      const value = Boolean(res);
      setIsVerified(value);
      return { data: value } as const;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch KYC status");
      return { data: undefined } as const;
    } finally {
      setIsLoading(false);
    }
  }, [client, registryAdmin, user]);

  useEffect(() => {
    if (user) refetch();
  }, [user, refetch]);

  return { isVerified, isLoading, error, refetch } as const;
}



