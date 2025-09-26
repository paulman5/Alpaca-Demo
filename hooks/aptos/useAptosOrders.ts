"use client";

import { useCallback, useState } from "react";
import { APTOS_ORDERS_MODULE } from "@/lib/aptos";
import { useAptosWallet } from "./useAptosWallet";

export function useAptosOrders() {
  const { signAndSubmit } = useAptosWallet();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const buyAsset = useCallback(
    async (tickerUtf8: string, usdcAmount: bigint | number | string) => {
      setIsPending(true);
      setError(null);
      setTxHash(null);
      try {
        const tx = {
          function: `${APTOS_ORDERS_MODULE}::buy_asset`,
          type_arguments: [],
          arguments: [new TextEncoder().encode(tickerUtf8), usdcAmount.toString()],
        } as any;
        const { hash } = await signAndSubmit(tx);
        setTxHash(hash);
        return hash;
      } catch (e: any) {
        setError(e?.message || "Failed to submit buy order");
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [signAndSubmit],
  );

  const sellAsset = useCallback(
    async (tickerUtf8: string, tokenAmount: bigint | number | string) => {
      setIsPending(true);
      setError(null);
      setTxHash(null);
      try {
        const tx = {
          function: `${APTOS_ORDERS_MODULE}::sell_asset`,
          type_arguments: [],
          arguments: [new TextEncoder().encode(tickerUtf8), tokenAmount.toString()],
        } as any;
        const { hash } = await signAndSubmit(tx);
        setTxHash(hash);
        return hash;
      } catch (e: any) {
        setError(e?.message || "Failed to submit sell order");
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [signAndSubmit],
  );

  return { buyAsset, sellAsset, isPending, error, txHash } as const;
}


