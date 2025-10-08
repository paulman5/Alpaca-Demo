"use client";

import { useCallback, useEffect, useState } from "react";
import { APTOS_KYC_MODULE, APTOS_PUBLISHER_ADDRESS } from "@/lib/aptos";
import { useAptosWallet } from "./useAptosWallet";
import { useAptosClient } from "./useAptosClient";

type HexAddress = string;

export function useKycRegistry() {
  const { signAndSubmit } = useAptosWallet();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const setVerified = useCallback(
    async (user: HexAddress, isVerified: boolean) => {
      setIsPending(true);
      setError(null);
      setTxHash(null);
      try {
        const tx = {
          function: `${APTOS_KYC_MODULE}::set_verified`,
          type_arguments: [],
          arguments: [user, isVerified],
        } as any;
        const { hash } = await signAndSubmit(tx);
        setTxHash(hash);
        return hash;
      } catch (e: any) {
        setError(e?.message || "Failed to set verified");
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [signAndSubmit],
  );

  return { setVerified, isPending, error, txHash } as const;
}

export function useIsKycVerified(user: HexAddress | undefined, owner: HexAddress = APTOS_PUBLISHER_ADDRESS) {
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
        arguments: [owner, user],
      } as any;
      const [res] = await client.view(payload);
      setIsVerified(Boolean(res));
      return { data: Boolean(res) } as const;
    } catch (e: any) {
      setError(e?.message || "Failed to fetch KYC status");
      return { data: undefined } as const;
    } finally {
      setIsLoading(false);
    }
  }, [client, owner, user]);

  useEffect(() => {
    if (user) refetch();
  }, [user, refetch]);

  return { isVerified, isLoading, error, refetch } as const;
}


